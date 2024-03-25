# Full Blog Application API

### Technologies

Javascript - Nodejs - ExpressJs - Postgresql - Sequelize - PassportJs - Jest - Supertest - Cloudinary - Sendgrid

### Features

#### Users

<ul>
<li>Create, get, update and delete users accounts </li>
<li>Filter users accounts</li>
<li>Upload and delete profile images using Cloudinary</li>
<li>Authenticate with email and password, Google and Github Passport Strategies</li>
<li>Create, get, update and delete blogs</li>
<li>Filter blogs</li>
<li>Create, get, update and delete posts</li>
<li>Filter posts</li>
<li>Upload and delete posts images using Cloudinary</li>
<li>Get, update and delete notifications</li>
<li>Like and dislike posts</li>
<li>Comment posts</li>
</ul>

#### Admin

<ul>
<li>Create admin accounts</li>
<li>Authenticate using Passport local strategy</li>
<li>Get and filter users accounts</li>
<li>Ban or not users accounts</li>
<li>Get and filter blogs</li>
<li>Ban or not blogs</li>
<li>Get and filter posts</li>
<li>Ban or not posts</li>
<li>Get and filter comments</li>
<li>Ban or not comments</li>
</ul>

#### More

<ul>
<li>Use of Express Sessions</li>
<li>Use of Express FileUpload</li>
<li>Send email using Sendgrid</li>
<li>Verify accounts using emails</li>
<li>Request and Reset passwords accounts using emails and tokens</li>
<li>Authorized routes for users and admins</li>
<li>Tests using Jest and Supertest</li>
</ul>

#### .env file

<li>Create in the root of the project a .env file in order to use it, and complete this env variables</li>
<br>
<pre>
DB_USER =
DB_PASSWORD =
DB_HOST =
DB_PORT =

DB_NAME =

SESSION_SECRET =

CLOUDINARY_CLOUD_NAME =
CLOUDINARY_API_KEY =
CLOUDINARY_API_SECRET =

GOOGLE_CLIENT_ID =
GOOGLE_CLIENT_SECRET =

GITHUB_CLIENT_ID =
GITHUB_CLIENT_SECRET =

SENDGRID_API_KEY =
SENDGRID_SENDER =

URL="http://localhost:PORT" -> for development

</pre>
