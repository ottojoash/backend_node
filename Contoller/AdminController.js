const AdminGateway = require('./AdminGateway'); // Import your AdminGateway or modify the import statement accordingly

class AdminController {
  constructor(db, requestMethod, adminId, customMethod) {
    this.db = db;
    this.requestMethod = requestMethod;
    this.adminId = adminId;
    this.customMethod = customMethod;
    this.adminGateway = new AdminGateway(db); // Instantiate your AdminGateway
  }

  processRequest() {
    switch (this.requestMethod) {
      case 'GET':
        if (this.adminId) {
          this.getAdmin(this.adminId);
        } else if (this.customMethod) {
          this.unprocessableEntityResponse(`Cannot get ${this.customMethod}`);
        } else {
          this.getAllAdmins();
        }
        break;
      case 'POST':
        this.createAdminFromRequest();
        break;
      case 'PUT':
        if (this.allowedCustomMethods.includes(this.customMethod)) {
          this.updateAdminFromRequest(this.adminId, this.customMethod);
        } else {
          this.unprocessableEntityResponse();
        }
        break;
      case 'DELETE':
        this.deleteAdmin(this.adminId);
        break;
      default:
        this.notFoundResponse();
        break;
    }
  }

  getAllAdmins() {
    const result = this.adminGateway.findAll();
    const response = {
      status_code_header: 'HTTP/1.1 200 OK',
      body: JSON.stringify(result),
    };
    this.sendResponse(response);
  }

  getAdmin(id) {
    const result = this.adminGateway.find(id);
    if (!result.success) {
      this.notFoundResponse();
    } else {
      const response = {
        status_code_header: 'HTTP/1.1 200 OK',
        body: JSON.stringify(result),
      };
      this.sendResponse(response);
    }
  }

  createAdminFromRequest() {
    const input = JSON.parse(req.body);
    const validation = this.validateAdmin(input);

    if (!validation[0]) {
      this.unprocessableEntityResponse(validation[1]);
    } else {
      const newAdmin = this.adminGateway.insert(input);
      if (newAdmin.success) {
        const response = {
          status_code_header: 'HTTP/1.1 201 Created',
          body: JSON.stringify(newAdmin),
        };
        this.sendResponse(response);
      } else {
        const response = {
          status_code_header: 'HTTP/1.1 502',
          body: JSON.stringify(newAdmin),
        };
        this.sendResponse(response);
      }
    }
  }

  updateAdminFromRequest(id, customMethod = null) {
    const result = this.adminGateway.find(id);
    if (!result.success) {
      this.notFoundResponse();
    } else {
      const input = JSON.parse(req.body);
      const validation = customMethod === "login"
        ? this.validateAdminLogin(input)
        : this.validateAdmin(input, false);
      if (!validation[0]) {
        this.unprocessableEntityResponse(validation[1] || "");
      } else {
        const res = customMethod === "login"
          ? this.adminGateway.login(input)
          : (customMethod === "updateAdminDetails"
            ? this.adminGateway.update(id, input)
            : (customMethod === "updatePassword"
              ? this.adminGateway.updatePassword(id, input)
              : this.adminGateway.update(id, input)));
        const response = {
          status_code_header: 'HTTP/1.1 200 OK',
          body: JSON.stringify(res),
        };
        this.sendResponse(response);
      }
    }
  }

  deleteAdmin(id) {
    const result = this.adminGateway.find(id);
    if (!result.success) {
      this.notFoundResponse();
    } else {
      const res = this.adminGateway.delete(id);
      const response = {
        status_code_header: 'HTTP/1.1 200 OK',
        body: JSON.stringify(res),
      };
      this.sendResponse(response);
    }
  }

  validateAdmin(input, isNew = true) {
    let error = null;

    if (!input.email) {
      return [false, "Provide an email"];
    }
    if (!input.username && isNew) {
      return [false, "Provide a username"];
    }
    if (!input.password && isNew) {
      return [false, "Provide a password"];
    }
    if (!input.name && isNew) {
      return [false, "Provide a name"];
    }
    return [error == null, error];
  }

  validateAdminLogin(input) {
    let error = null;

    if (!input.email) {
      return [false, "Provide an email"];
    }
    if (!input.password) {
      return [false, "Provide a password"];
    }
    return [error == null, error];
  }

  unprocessableEntityResponse(errorMessage = null) {
    const response = {
      status_code_header: 'HTTP/1.1 422 Unprocessable Entity',
      body: JSON.stringify({
        error: true,
        message: errorMessage == null ? 'Invalid input' : errorMessage,
      }),
    };
    this.sendResponse(response);
  }

  notFoundResponse() {
    const res = {
      error: true,
      message: "Element not found",
    };
    const response = {
      status_code_header: 'HTTP/1.1 404 Not Found',
      body: JSON.stringify(res),
    };
    this.sendResponse(response);
  }

  sendResponse(response) {
    res.status(response.status_code_header);
    if (response.body) {
      res.send(response.body);
    }
  }
}

module.exports = AdminController;
