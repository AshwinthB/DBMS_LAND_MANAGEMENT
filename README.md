Land-Management-system
A land management system with user roles and government schemes

Land Management System Overview The Land Management System is designed to manage land records, ownership, legal cases, loans, and government schemes with user-specific roles and privileges. The system is structured to accommodate four types of user roles: Admin, Court, Bank, and Normal User. Each role has specific functionalities and restrictions to ensure proper management and secure handling of land-related data.

This detailed description will cover:

Types of Login

Description of Each Login Type

Criteria and Rules

Page Descriptions

Types of Login The Land Management System provides four types of login to cater to various user roles. Each role has distinct privileges and responsibilities:
1.1 Admin Login Highest Privilege Role: Admin has the ability to manage and modify all aspects of land records, ownership details, cases, loans, and government schemes.

Key Responsibilities: Admins can create new records, transfer ownership, apply government schemes, and update all land-related details.

1.2 Court Login Case Management Role: Court users are responsible for managing the legal aspects related to land, including handling case details and statuses.

Key Responsibilities: Court users can update case-related information for lands but cannot modify ownership or loan data.

1.3 Bank Login Loan Management Role: Bank users manage the financial aspect of the land records, particularly loan-related information.

Key Responsibilities: Bank users can view and update loan details but cannot modify ownership or case-related data.

1.4 Normal User Login Basic Viewing Role: Normal users are restricted to only viewing land records and updating minor personal details.

Key Responsibilities: Normal users can view land records and minor owner details, such as contact information (phone number, address, etc.).

Description of Each Login Type Each user role in the system is given specific privileges based on their responsibility. Below is a detailed breakdown of each login type:
2.1 Admin Login Responsibilities:

View All Land Records: Admins can view all land records in the system, including detailed information about land, ownership, legal cases, loans, and government schemes.

Insert New Records: Admins have the ability to insert new records for land, owners, case details, address information, and government schemes.

Apply Government Schemes: Admins can apply government schemes to eligible lands, checking if the land is free from active legal cases or loans.

Transfer Land Ownership: Admins are authorized to transfer land ownership between owners, subject to specific checks (e.g., no active cases or loans).

Edit All Land Details: Admins can modify any land-related information, including case statuses, loans, ownership, and address details.

2.2 Court Login Responsibilities:

View All Land Records: Court users can view land records for legal reference.

Update Case Details: Court users can update case-related information such as ongoing cases, court orders, or legal disputes linked to specific lands.

No Ownership or Loan Modifications: Court users cannot change ownership or loan details but can view them for reference.

2.3 Bank Login Responsibilities:

View All Land Records: Bank users can access land records to check for loans and financial details.

Update Loan Details: Bank users are allowed to update loan information associated with specific lands (e.g., loan amount, status).

No Case or Ownership Changes: Bank users do not have the privilege to alter ownership or case-related information. They can only modify financial (loan) details.

2.4 Normal User Login Responsibilities:

View Land Records: Normal users can access a table displaying land records.

View Full Land Details: Normal users can view detailed information for a specific land (owner, case, loan, and address).

Update Minor Personal Details: Normal users can update their own minor personal information, such as name, phone number, email address, or home address, but they cannot modify legal or ownership information.

Criteria and Rules for Actions The system enforces several important rules and criteria to ensure proper land management, avoid conflicts, and maintain data integrity.
3.1 Government Scheme Application Criteria One Scheme per Land: Each land can only be enrolled in one government scheme at a time. If a scheme has already been applied, the system blocks any new scheme applications.

Eligibility: Lands must meet specific eligibility criteria for government schemes, such as the correct size and location of the land, or other conditions defined by the scheme.

Active Case/Loan Check: Before applying for a government scheme, the system checks for any active legal cases or loans. If the land has an active case or loan, no new scheme can be applied until the issue is resolved.

3.2 Land Transfer Restrictions No Active Case or Loan: A land cannot be transferred to a new owner if it is involved in an active legal case or has an outstanding loan. The system ensures that ownership transfer is blocked in these cases.

Case and Loan Verification: The system checks the status of cases and loans associated with the land before allowing the transfer. If there are active cases or loans, the transfer is not allowed until these are resolved.

3.3 Minor Details Update for Owners Normal Users: Can update only their own minor details (e.g., phone numbers, emails, or home addresses).

Admin Role: Admins can update both minor and major details for landowners, including personal and legal information.

No Update on Legal Information: Normal users cannot change any legal information, such as case statuses or loan details. These fields are only accessible to Court, Bank, or Admin users.

3.4 Role-Specific Permissions Each user role has specific permissions and restrictions based on their responsibilities:

Admin: Can view and edit all land records, apply government schemes, transfer ownership, and manage details for owners, cases, and loans.

Court: Can only view and update legal case details for lands.

Bank: Can only view and update loan information.

Normal User: Can only view land records and update personal information for owners.

Page Descriptions The system consists of several pages designed for different functions. Below are detailed descriptions of the key pages within the Land Management System:
4.1 Login Page Purpose: The login page serves as the gateway to the system, allowing users to enter their credentials (username and password).

Features:

Username and password fields.

A login button to authenticate the user.

Role-based redirection after a successful login (Admin, Court, Bank, or Normal User).

4.2 View All Land Records Purpose: This page displays a table listing all land records in the system. It is accessible to Admin, Court, Bank, and Normal Users.

Features:

A table displaying essential details like land ID, owner name, and land size.

Search functionality to filter records based on criteria like land type, location, and more.

A button to view detailed information about each land record.

4.3 Full Land Details (Owner, Case, Loan, Address) Purpose: This page provides detailed information about a specific land, including ownership details, case status, loan information, and the address.

Features:

Display of all relevant land details.

Option to update minor owner details for Normal Users.

A navigation button to return to the "View All Land Records" page.

4.4 Update Landowner Details (Admin, Normal User) Purpose: This page allows users to update owner details such as name, phone number, and address. Admins have full access to modify both minor and major details of owners, while Normal Users can only update their own minor details.

Features:

Input fields for personal owner details (e.g., name, phone number, email).

A "Save Changes" button to submit the updated information.

Confirmation message after a successful update.

4.5 Government Scheme Application (Admin) Purpose: This page allows Admin users to apply for government schemes on eligible lands.

Features:

A form to select the appropriate government scheme.

Eligibility checks (e.g., land size, no active cases or loans).

A submit button to apply the scheme.

Summary The Land Management System is designed to ensure smooth and secure land record management with distinct roles for different users. Admins manage all records, Court users handle case details, Bank users manage loans, and Normal Users can only view and update minor details. The system incorporates specific criteria for government scheme applications, land transfers, and minor updates to ensure proper data handling and prevent unauthorized actions.

About
A land management system with user roles and government schemes

Resources
 Readme
 Activity
Stars
 0 stars
Watchers
 1 watching
Forks
 0 forks
Releases
No releases published
Create a new release
Packages
No packages published
Publish your first package
Languages
HTML
63.2%
 
JavaScript
35.1%
 
CSS
1.7%
Suggested workflows
Based on your tech stack
Node.js logo
Node.js
Build and test a Node.js project with npm.
SLSA Generic generator logo
SLSA Generic generator
Generate SLSA3 provenance for your existing release workflows
Publish Node.js Package to GitHub Packages logo
Publish Node.js Package to GitHub Packages
Publishes a Node.js package to GitHub Packages.
More workflows
Footer
©
