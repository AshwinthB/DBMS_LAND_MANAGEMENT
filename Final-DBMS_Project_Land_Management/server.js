const express = require("express");
const bodyParser = require("body-parser");
const mysql = require("mysql2");
const path = require("path");
const nodemailer = require("nodemailer");

const app = express();
app.use(bodyParser.json());
const PORT = 3000;

app.use(express.static("public"));
app.use(bodyParser.json());

// MySQL connection
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "Ashwinth3583#",
    database: "land" // replace with your actual DB name
    
    
});

db.connect((err) => {
    if (err) throw err;
    console.log("Connected to MySQL database.");
});

let otps = {}; // In-memory OTP store

// Send OTP
app.post("/send-otp", (req, res) => {
    const { email } = req.body;
    const otp = Math.floor(100000 + Math.random() * 900000);
    otps[email] = otp;

    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: "ashwinthbalu2022@gmail.com", // use an app password
            pass: "pxtxceegixqirdxe"
        }
    });

    const mailOptions = {
        from: "your-email@gmail.com",
        to: email,
        subject: "Email Verification OTP",
        text: `Your OTP for registration is: ${otp}`
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error)return res.status(500).json({ message: "Failed to send OTP" });
        res.status(200).json({ message: "OTP sent successfully" });
    });
});

// Verify OTP and Register
app.post("/register", (req, res) => {
    const { name, gender, email, password, mobile, otp } = req.body;
    if (!name || !gender || !email || !password || !mobile || !otp) {
        return res.status(400).json({ message: "All fields are required." });
    }

    if (otps[email] != otp) {
        return res.status(401).json({ message: "Invalid OTP." });
    }

    const sql = "INSERT INTO user_auth (name, gender, email, password, mobile) VALUES (?, ?, ?, ?, ?)";
    db.query(sql, [name, gender, email, password, mobile], (err) => {
        if (err) {
            if (err.code === "ER_DUP_ENTRY") {
                return res.status(400).json({ message: "Email or mobile already registered." });
            }
            return res.status(500).json({ message: "Server error." });
        }
        delete otps[email]; // OTP used, remove it
        res.status(201).json({ message: "User registered successfully!" });
    });
});
app.post("/login", (req, res) => {
    const { username, password } = req.body;

    if (username === "admin" && password === "admin2025") {
        return res.json({ message: "Welcome Admin", role: "admin" });
    }

    if (username === "bank" && password === "bank2025") {
        return res.json({ message: "Welcome Bank Officer", role: "bank" });
    }

    if (username === "court" && password === "court2025") {
        return res.json({ message: "Welcome Court Office", role: "court" });
    }

    const sql = "SELECT * FROM user_auth WHERE name = ? AND password = ?";
    db.query(sql, [username, password], (err, results) => {
        if (err) return res.status(500).json({ message: "Server error." });
        if (results.length > 0) {
            res.json({ message: "Login successful!", role: "user" });
        } else {
            res.status(401).json({ message: "Invalid username or password." });
        }
    });
});

// Insert owner, land, and address data
app.post("/insert-owner-land", (req, res) => {
  const {
    o_id, o_name, gender, mobile, email,
    l_id, land_type, land_size, land_price, survey, willing,
    village, taluk, district, pincode, state, nationality,
    otp
  } = req.body;

  // Step 0: Verify OTP
  if (!otps[email] || otps[email] != otp) {
    return res.status(400).json({ message: "Invalid or expired OTP." });
  }

  // Proceed with transaction if OTP matches
  db.beginTransaction(err => {
    if (err) {
      console.error("Transaction error:", err);
      return res.status(500).json({ message: "Transaction start failed." });
    }

    // Insert into owner
    const ownerQuery = `INSERT INTO owner (o_id, o_name, gender, mobile, email) VALUES (?, ?, ?, ?, ?)`;
    db.query(ownerQuery, [o_id, o_name, gender, mobile, email], (err1) => {
      if (err1) {
        return db.rollback(() => {
          console.error("Owner insert error:", err1);
          return res.status(500).json({ message: "Failed to insert owner." });
        });
      }

      // Insert into land_details
      const landQuery = `INSERT INTO land_details (l_id, land_type, land_size, land_price, o_id, survey, willing) VALUES (?, ?, ?, ?, ?, ?, ?)`;
      db.query(landQuery, [l_id, land_type, land_size, land_price, o_id, survey, willing], (err2) => {
        if (err2) {
          return db.rollback(() => {
            console.error("Land insert error:", err2);
            return res.status(500).json({ message: "Failed to insert land details." });
          });
        }

        // Update owner with l_id
        const updateOwner = `UPDATE owner SET l_id = ? WHERE o_id = ?`;
        db.query(updateOwner, [l_id, o_id], (err3) => {
          if (err3) {
            return db.rollback(() => {
              console.error("Owner update error:", err3);
              return res.status(500).json({ message: "Failed to update owner with land ID." });
            });
          }

          // Insert into address
          const addressQuery = `INSERT INTO address (l_id, village, taluk, district, pincode, state, nationality) VALUES (?, ?, ?, ?, ?, ?, ?)`;
          db.query(addressQuery, [l_id, village, taluk, district, pincode, state, nationality], (err4) => {
            if (err4) {
              return db.rollback(() => {
                console.error("Address insert error:", err4);
                return res.status(500).json({ message: "Failed to insert address." });
              });
            }

            db.commit(errCommit => {
              if (errCommit) {
                return db.rollback(() => {
                  console.error("Commit error:", errCommit);
                  return res.status(500).json({ message: "Commit failed." });
                });
              }

              delete otps[email]; // OTP used, delete it
              return res.status(201).json({ message: "Owner, land, and address inserted successfully." });
            });
          });
        });
      });
    });
  });
});

app.get('/get-old-email/:ownerId', (req, res) => {
  const ownerId = req.params.ownerId;
  const query = "SELECT email FROM owner WHERE o_id = ?";
  db.query(query, [ownerId], (err, result) => {
    if (err) return res.status(500).json({ error: "Database error" });
    if (result.length === 0) return res.status(404).json({ error: "Old owner not found" });
    res.json({ email: result[0].email });
  });
});


  app.get("/get-schemes", (req, res) => {
    const sql = "SELECT g_name, elegible FROM gov_scheme";
    db.query(sql, (err, results) => {
      if (err) return res.status(500).json({ message: "Error fetching schemes" });
      res.json(results);
    });
  });
  // Utility function to convert land size string (e.g., "1.5 acres") to number
// Required at top of file
app.use(bodyParser.urlencoded({ extended: true }));

// Helper function to get land details
const getLandDetails = (owner_id) => {
    return new Promise((resolve, reject) => {
        const sql = "SELECT l.l_id, l.land_size FROM owner o JOIN land_details l ON o.l_id = l.l_id WHERE o.o_id = ?";
        db.query(sql, [owner_id], (err, results) => {
            if (err) return reject(err);
            if (results.length === 0) return resolve(null);
            resolve(results[0]);
        });
    });
};

app.post("/apply-scheme1", async (req, res) => {
  const { g1_id, owner_id, benificier } = req.body;
  try {
      const land = await getLandDetails(owner_id);
      if (!land) return res.status(404).json({ message: "Owner or Land not found" });

      const landSize = parseFloat(land.land_size);
      if (landSize >= 2) return res.status(400).json({ message: "Not eligible: Land size must be < 2 acres" });

      const amount = Math.floor(landSize * 500 * 12); // Benefit calculation

      const checkSql = "SELECT * FROM gov_scheme1 WHERE l_id = ?";
      db.query(checkSql, [land.l_id], (err, results) => {
          if (err) return res.status(500).json({ message: "Server error" });
          if (results.length > 0) return res.status(400).json({ message: "Already applied for this scheme" });

          const insertSql = "INSERT INTO gov_scheme1 (g1_id, l_id, o_id, benificier, amount) VALUES (?, ?, ?, ?, ?)";
          db.query(insertSql, [g1_id, land.l_id, owner_id, benificier, amount], (err2) => {
              if (err2) return res.status(500).json({ message: "Failed to apply" });
              res.json({ message: `Applied successfully! Benefit Amount: ₹${amount}`, amount });
          });
      });
  } catch (error) {
      res.status(500).json({ message: "Something went wrong" });
  }
});
app.post("/apply-scheme2", async (req, res) => {
  const { g2_id, owner_id, benificier } = req.body;
  try {
      const land = await getLandDetails(owner_id);
      if (!land) return res.status(404).json({ message: "Owner or Land not found" });

      const landSize = parseFloat(land.land_size);
      if (landSize < 2 || landSize > 5) {
          return res.status(400).json({ message: "Not eligible: Land size must be between 2-5 acres" });
      }

      const amount = Math.floor(landSize * 400 * 12); // MidAgriSupport benefit

      const checkSql = "SELECT * FROM gov_scheme2 WHERE l_id = ?";
      db.query(checkSql, [land.l_id], (err, results) => {
          if (err) return res.status(500).json({ message: "Server error" });
          if (results.length > 0) return res.status(400).json({ message: "Already applied for this scheme" });

          const insertSql = "INSERT INTO gov_scheme2 (g2_id, l_id, o_id, benificier, amount) VALUES (?, ?, ?, ?, ?)";
          db.query(insertSql, [g2_id, land.l_id, owner_id, benificier, amount], (err2) => {
              if (err2) {
                  if (err2.sqlMessage) {
                      return res.status(400).json({ message: err2.sqlMessage });
                  }
                  return res.status(500).json({ message: "Failed to apply" });
              }
              res.json({ message: `Applied successfully! Benefit Amount: ₹${amount}`, amount });
          });
      });
  } catch (error) {
      res.status(500).json({ message: "Something went wrong" });
  }
});

app.post("/apply-scheme3", async (req, res) => {
  const { g3_id, owner_id, benificier } = req.body;
  try {
      const land = await getLandDetails(owner_id);
      if (!land) return res.status(404).json({ message: "Owner or Land not found" });

      const landSize = parseFloat(land.land_size);
      if (landSize <= 5) {
          return res.status(400).json({ message: "Not eligible: Land size must be greater than 5 acres" });
      }

      const amount = Math.floor(landSize * 300 * 12);

      const checkSql = "SELECT * FROM gov_scheme3 WHERE l_id = ?";
      db.query(checkSql, [land.l_id], (err, results) => {
          if (err) return res.status(500).json({ message: "Server error" });
          if (results.length > 0) return res.status(400).json({ message: "Already applied for this scheme" });

          const insertSql = "INSERT INTO gov_scheme3 (g3_id, l_id, o_id, benificier, amount) VALUES (?, ?, ?, ?, ?)";
          db.query(insertSql, [g3_id, land.l_id, owner_id, benificier, amount], (err2) => {
              if (err2) {
                  if (err2.sqlMessage) {
                      return res.status(400).json({ message: err2.sqlMessage });
                  }
                  return res.status(500).json({ message: "Failed to apply" });
              }
              res.json({ message: `Applied successfully! Benefit Amount: ₹${amount}`, amount });
          });
      });
  } catch (error) {
      res.status(500).json({ message: "Something went wrong" });
  }
});


app.post("/update-loan", (req, res) => {
  const { lo_id, loan_details, loan_status } = req.body;

  const sql = "UPDATE loan_details SET loan_details = ?, loan_status = ? WHERE lo_id = ?";
  db.query(sql, [loan_details, loan_status, lo_id], (err, result) => {
    if (err) {
      console.error("Error updating loan:", err);
      return res.status(500).json({ message: "Failed to update loan details" });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Loan ID not found" });
    }

    res.json({ message: "Loan details updated successfully!" });
  });
});
  app.get("/check-land/:owner_id", (req, res) => {
    const { owner_id } = req.params;
    console.log(owner_id);
    // Step 1: Check if land exists for this owner in land_details
    const landQuery = "SELECT l_id FROM land_details WHERE o_id = ?";
    db.query(landQuery, [owner_id], (err, landResults) => {
      if (err) {
        console.error("Error checking land:", err);
        return res.status(500).json({ message: "Database error while checking land" });
      }
  
      if (landResults.length === 0) {
        return res.status(404).json({ message: "No land found for this Owner ID." });
      }
  
      // Step 2: If land exists, check if there is a loan for this owner
      const loanQuery = "SELECT lo_id FROM loan_details WHERE o_id = ?";
      db.query(loanQuery, [owner_id], (err, loanResults) => {
        if (err) {
          console.error("Error checking loan:", err);
          return res.status(500).json({ message: "Database error while checking loan" });
        }
  
        if (loanResults.length > 0) {
          res.json({ loan_id: loanResults[0].lo_id });
        } else {
          res.status(404).json({ message: "Land found, but no loan associated with this Owner ID." });
        }
      });
    });
  });
 
  app.get('/check-land-case/:owner_id', (req, res) => {
    const { owner_id } = req.params;
  
    // Step 1: Check if land exists for this owner in land_details
    const landQuery = "SELECT l_id FROM land_details WHERE o_id = ?";
    db.query(landQuery, [owner_id], (err, landResults) => {
      if (err) {
        console.error("Error checking land:", err);
        return res.status(500).json({ message: "Database error while checking land" });
      }
  
      if (landResults.length === 0) {
        return res.status(404).json({ message: "No land found for this Owner ID." });
      }
  
      // Step 2: If land exists, fetch case ID from case_details
      const caseQuery = "SELECT c_id FROM case_details WHERE o_id = ?";
      db.query(caseQuery, [owner_id], (err, caseResults) => {
        if (err) {
          console.error("Error checking case:", err);
          return res.status(500).json({ message: "Database error while checking case" });
        }
  
        if (caseResults.length > 0) {
          res.json({ c_id: caseResults[0].c_id });
        } else {
          res.status(404).json({ message: "Land found, but no case associated with this Owner ID." });
        }
      });
    });
  });
  app.get('/check-land-land/:owner_id', (req, res) => {
    const { owner_id } = req.params;
  
    const query = "SELECT l_id FROM land_details WHERE o_id = ?";
    db.query(query, [owner_id], (err, results) => {
      if (err) {
        console.error("Error checking land:", err);
        return res.status(500).json({ message: "Database error while checking land." });
      }
  
      if (results.length === 0) {
        return res.status(404).json({ message: "No land found or land already sold." });
      }
  
      // Return the land ID if found
      return res.json({ l_id: results[0].l_id });
    });
  });
  
  app.post("/update-case", (req, res) => {
    console.log('executed');
    const { c_id, case_details, case_status } = req.body;
    const query = "UPDATE case_details SET case_details = ?, case_status = ? WHERE c_id = ?";
    db.query(query, [case_details, case_status, c_id], (err, result) => {
      if (err) {
        console.error("Update error:", err);
        return res.status(500).json({ message: "Failed to update case details" });
      }
      res.json({ message: "Case details updated successfully!" });
    });
  });
  

  app.get('/get-owner-email/:o_id', (req, res) => {
    const { o_id } = req.params;
    db.query("SELECT email FROM owner WHERE o_id = ?", [o_id], (err, results) => {
      if (err) return res.status(500).json({ message: "Database error" });
      if (results.length === 0) return res.status(404).json({ message: "Owner not found" });
      res.json({ email: results[0].email });
    });
  });
  

  app.post("/verify-otp", (req, res) => {
    const { email, otp } = req.body;
  
    if (!otps[email]) {
      return res.status(400).json({ message: "OTP not requested." });
    }
  
    if (otps[email] != otp) {
      return res.status(401).json({ message: "Invalid OTP." });
    }
  
    delete otps[email]; // Remove OTP after success
    res.json({ message: "OTP verified successfully." });
  });
  
  
  
  
  app.get('/get-price/:lid', (req, res) => {
    const lid = req.params.lid;
    const sql = "SELECT land_price FROM land_details WHERE l_id = ?";
    db.query(sql, [lid], (err, result) => {
      if (err) return res.json({ error: "DB error" });
      if (result.length === 0) return res.json({ error: "Land not found" });
  
      const price = result[0].land_price;
      const tax = (0.15 * price).toFixed(2);
      res.json({ price, tax });
    });
  });

  app.post('/transfer-land', (req, res) => {
    const { oldOwnerId, newOwnerId, landId, ownerName, gender, mobile,newEmail} = req.body;
  
    const getLandDetails = "SELECT land_price FROM land_details WHERE l_id = ? AND o_id = ?";
    db.query(getLandDetails, [landId, oldOwnerId], (err, result) => {
      if (err) {
        console.error("Ownership check error:", err);
        return res.status(500).json({ error: "Database error during ownership check" });
      }
      if (result.length === 0)
        return res.status(400).json({ error: "Old owner does not own the given land ID" });
  
      const price = result[0].land_price;
      const tax = (price * 0.15).toFixed(2);
  
      const getOwnerRefs = "SELECT c_id, lo_id FROM owner WHERE o_id = ?";
      db.query(getOwnerRefs, [oldOwnerId], (err, refResult) => {
        if (err) {
          console.error("Owner reference fetch error:", err);
          return res.status(500).json({ error: "Error fetching old owner's info" });
        }
        if (refResult.length === 0)
          return res.status(400).json({ error: "Old owner data not found" });
  
        const { c_id: caseId, lo_id: loanId } = refResult[0];
  
        const caseCheckQuery = "SELECT * FROM case_details WHERE l_id = ? AND NOT case_status IN ('no', 'completed', 'no case')";
        const loanCheckQuery = "SELECT * FROM loan_details WHERE l_id = ? AND NOT loan_status IN ('no', 'completed','no loan')";
  
        db.query(caseCheckQuery, [landId], (err, caseResult) => {
          if (err) return res.status(500).json({ error: "Error checking case status" });
          if (caseResult.length > 0)
            return res.status(400).json({ error: "Case is pending or not cleared" });
  
          db.query(loanCheckQuery, [landId], (err, loanResult) => {
            if (err) return res.status(500).json({ error: "Error checking loan status" });
            if (loanResult.length > 0)
              return res.status(400).json({ error: "Loan is pending or not cleared" });
  
            const insertNewOwner = `
              INSERT INTO owner (o_id, o_name, gender, mobile, l_id, c_id, lo_id,email)
              VALUES (?, ?, ?, ?, ?, ?, ?,?)
            `;
            db.query(insertNewOwner, [newOwnerId, ownerName, gender, mobile, landId, caseId, loanId,newEmail], (err) => {
              if (err) {
                console.error("Insert new owner error:", err);
                return res.status(500).json({ error: "Error inserting new owner", details: err.sqlMessage });
              }
  
              const insertTrans = `
                INSERT INTO trans (old_owner_id, new_owner_id, price, tax, owner_name, l_id)
                VALUES (?, ?, ?, ?, ?, ?)
              `;
              db.query(insertTrans, [oldOwnerId, newOwnerId, price, tax, ownerName, landId], (err) => {
                if (err) {
                  console.error("Insert into trans error:", err.sqlMessage || err);
                  return res.status(500).json({ error: "Error inserting transfer record", details: err.sqlMessage });
                }
  
                const updateLand = `UPDATE land_details SET o_id = ? WHERE l_id = ?`;
                const updateCase = `UPDATE case_details SET o_id = ? WHERE l_id = ?`;
                const updateLoan = `UPDATE loan_details SET o_id = ? WHERE l_id = ?`;
  
                db.query(updateLand, [newOwnerId, landId], (err) => {
                  if (err) return res.status(500).json({ error: "Error updating land_details" });
  
                  db.query(updateCase, [newOwnerId, landId], (err) => {
                    if (err) return res.status(500).json({ error: "Error updating case_details" });
  
                    db.query(updateLoan, [newOwnerId, landId], (err) => {
                      if (err) return res.status(500).json({ error: "Error updating loan_details" });
  
                      const delete1 = `DELETE FROM gov_scheme1 WHERE l_id = ?`;
                      const delete2 = `DELETE FROM gov_scheme2 WHERE l_id = ?`;
                      const delete3 = `DELETE FROM gov_scheme3 WHERE l_id = ?`;
  
                      db.query(delete1, [landId], () => {
                        db.query(delete2, [landId], () => {
                          db.query(delete3, [landId], () => {
  
                            // 🟢 Nullify old owner's land-related fields (l_id, c_id, lo_id)
                            const nullifyOldOwner = `
                              UPDATE owner
                              SET l_id = NULL, c_id = NULL, lo_id = NULL
                              WHERE o_id = ?
                            `;
                            db.query(nullifyOldOwner, [oldOwnerId], (err) => {
                              if (err) {
                                console.error("Error nullifying old owner:", err);
                                return res.status(500).json({ error: "Error updating old owner data" });
                              }
  
                              console.log("✅ Transfer completed");
                              return res.json({ success: true, price, tax });
                            });
                          });
                        });
                      });
                    });
                  });
                });
              });
            });
          });
        });
      });
    });
  });
  
  
  
  // Get all land details

  app.get('/land-details', (req, res) => {
    const query = `
      SELECT ld.l_id, ld.land_type, ld.land_size, ld.land_price, ld.survey, ld.willing, ld.o_id, a.district
      FROM land_details ld
      JOIN address a ON ld.l_id = a.l_id
    `;
    db.query(query, (err, results) => {
      if (err) {
        console.error('Error fetching land details with district:', err);
        return res.status(500).json({ message: 'Internal Server Error' });
      }
      res.json(results);
    });
  });
  
  // Route to get owner details by ID
  // Existing owner route
app.get('/owner-details/:id', (req, res) => {
  const o_id = req.params.id;
  db.query('SELECT o_name, gender, mobile FROM owner WHERE o_id = ?', [o_id], (err, results) => {
    if (err) return res.status(500).json({ message: 'Error retrieving owner' });
    if (results.length === 0) return res.status(404).json({ message: 'Owner not found' });
    res.json(results[0]);
  });
});

// Loan Details
app.get('/loan-details/:id', (req, res) => {
  const o_id = req.params.id;
  db.query('SELECT * FROM loan_details WHERE o_id = ? LIMIT 1', [o_id], (err, results) => {
    if (err) return res.status(500).json({ message: 'Error retrieving loan' });
    if (results.length === 0) return res.status(404).json({ message: 'Loan not found' });
    res.json(results[0]);
  });
});

// Case Details
app.get('/case-details/:id', (req, res) => {
  const o_id = req.params.id;
  db.query('SELECT * FROM case_details WHERE o_id = ? LIMIT 1', [o_id], (err, results) => {
    if (err) return res.status(500).json({ message: 'Error retrieving case' });
    if (results.length === 0) return res.status(404).json({ message: 'Case not found' });
    res.json(results[0]);
  });
});

// Address Details (based on land id related to owner)
app.get('/address-details/:id', (req, res) => {
  const o_id = req.params.id;
  const sql = `
    SELECT a.* FROM address a
    JOIN land_details l ON a.l_id = l.l_id
    JOIN owner o ON o.l_id = l.l_id
    WHERE o.o_id = ? LIMIT 1`;
  db.query(sql, [o_id], (err, results) => {
    if (err) return res.status(500).json({ message: 'Error retrieving address' });
    if (results.length === 0) return res.status(404).json({ message: 'Address not found' });
    res.json(results[0]);
  });
});
app.get('/land-details/:id', (req, res) => {
  const o_id = req.params.id;
  const sql = `
    SELECT l.* FROM land_details l
    JOIN owner o ON o.l_id = l.l_id
    WHERE o.o_id = ? LIMIT 1
  `;
  db.query(sql, [o_id], (err, results) => {
    if (err) return res.status(500).json({ message: 'Error retrieving land details' });
    if (results.length === 0) return res.status(404).json({ message: 'Land not found' });
    res.json(results[0]);
  });
});

app.post('/update-owner', (req, res) => {
  const { o_id, o_name, gender, mobile, willing } = req.body;

  if (!o_id || !o_name || !gender || !mobile || !willing) {
    return res.json({ success: false, message: "Missing required fields." });
  }

  // Step 1: Check if land exists for this owner
  const checkLandQuery = `SELECT * FROM land_details WHERE o_id = ?`;

  db.query(checkLandQuery, [o_id], (err, result) => {
    if (err) {
      console.error("Error checking land:", err);
      return res.json({ success: false, message: "Database error." });
    }

    if (result.length === 0) {
      return res.json({ success: false, message: "Owner has no land linked. Cannot update." });
    }

    // Step 2: Update owner table
    const updateOwnerQuery = `
      UPDATE owner 
      SET o_name = ?, gender = ?, mobile = ?
      WHERE o_id = ?
    `;

    db.query(updateOwnerQuery, [o_name, gender, mobile, o_id], (err, result1) => {
      if (err) {
        console.error("Owner update error:", err);
        return res.json({ success: false, message: "Failed to update owner details." });
      }

      // Step 3: Update land_details table
      const updateWillingQuery = `
        UPDATE land_details 
        SET willing = ?
        WHERE o_id = ?
      `;

      db.query(updateWillingQuery, [willing, o_id], (err, result2) => {
        if (err) {
          console.error("Willing update error:", err);
          return res.json({ success: false, message: "Failed to update land's willingness." });
        }

        return res.json({ success: true, message: "Owner and land willingness updated successfully." });
      });
    });
  });
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
