-- IF TYPE_ID(N'state_type') IS NULL CREATE TYPE state_type as ENUM('failure','anomaly','normal');

CREATE TABLE device (id SERIAL PRIMARY KEY, name varchar(30), state state_type DEFAULT 'normal', device_id varchar(30));

CREATE TABLE tag (name varchar(30) PRIMARY KEY);

CREATE TABLE device_tag (device_id int, tag_id varchar(30), FOREIGN KEY(device_id) REFERENCES device(id) ON DELETE CASCADE, FOREIGN KEY(tag_id) REFERENCES tag(name) ON DELETE CASCADE, PRIMARY KEY(device_id, tag_id));

CREATE TABLE category (name varchar(30) PRIMARY KEY);

CREATE TABLE master_data (device_id int, value varchar(30), category_id varchar(30), FOREIGN KEY(device_id) REFERENCES device(id) ON DELETE CASCADE, FOREIGN KEY(category_id) REFERENCES category(name) ON DELETE CASCADE, PRIMARY KEY(device_id, category_id));
