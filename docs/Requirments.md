a.) Develop a system using Angular, Node.js, and an RDBMS (MySQL/PostgreSQL) with the following features:

1 - User CRUD – Can create and update categories/products.
2 - Category CRUD – Manage categories efficiently.
3 - Product CRUD – Products must belong to a category.
4 - Bulk Upload – Handle large product data uploads without timeout errors (504).
5 - Report Generation – Download product reports (CSV/XLSX) without timeout errors.

b.) Product List API Requirements:

1.) Server-side pagination.
2.) Sorting by price (asc/desc).
3.) Search by category and product names.

c.) Database & API Requirements:

1.) User: Email, Encrypted Password.
2.) Category: Name, UniqueID (auto-generated).
3.) Product: Name, Image, Price, UniqueID (auto-generated), Category (belongs to a category).
