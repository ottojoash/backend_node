const HostelGateway = require('./HostelGateway'); // Import your HostelGateway or modify the import statement accordingly

class HostelController {
  constructor(db, requestMethod, hostelId) {
    this.db = db;
    this.requestMethod = requestMethod;
    this.hostelId = hostelId;
    this.hostelGateway = new HostelGateway(db); // Instantiate your HostelGateway
  }

  processRequest() {
    switch (this.requestMethod) {
      case 'GET':
        if (this.hostelId) {
          this.getHostel(this.hostelId);
        } else {
          this.getAllHostels();
        }
        break;
      case 'POST':
        this.createHostelFromRequest();
        break;
      case 'PUT':
        this.updateHostelFromRequest(this.hostelId);
        break;
      case 'DELETE':
        this.deleteHostel(this.hostelId);
        break;
      default:
        this.notFoundResponse();
        break;
    }
  }

  getAllHostels() {
    const result = this.hostelGateway.findAll();
    const response = {
      status_code_header: 'HTTP/1.1 200 OK',
      body: JSON.stringify(result),
    };
    this.sendResponse(response);
  }

  getHostel(id) {
    const result = this.hostelGateway.find(id);
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

  createHostelFromRequest() {
    const input = JSON.parse(req.body);
    const validation = this.validateHostel(input);

    if (!validation[0]) {
      this.unprocessableEntityResponse(validation[1]);
    } else {
      const newHostel = this.hostelGateway.insert(input);
      if (newHostel.success) {
        const response = {
          status_code_header: 'HTTP/1.1 201 Created',
          body: JSON.stringify(newHostel),
        };
        this.sendResponse(response);
      } else {
        const response = {
          status_code_header: 'HTTP/1.1 502',
          body: JSON.stringify(newHostel),
        };
        this.sendResponse(response);
      }
    }
  }

  updateHostelFromRequest(id) {
    const result = this.hostelGateway.find(id);
    if (!result.success) {
      this.notFoundResponse();
    } else {
      const input = JSON.parse(req.body);
      const validation = this.validateHostel(input);
      if (!validation[0]) {
        this.unprocessableEntityResponse(validation[1]);
      } else {
        const res = this.hostelGateway.update(id, input);
        const response = {
          status_code_header: 'HTTP/1.1 200 OK',
          body: JSON.stringify(res),
        };
        this.sendResponse(response);
      }
    }
  }

  deleteHostel(id) {
    const result = this.hostelGateway.find(id);
    if (!result.success) {
      this.notFoundResponse();
    } else {
      const res = this.hostelGateway.delete(id);
      const response = {
        status_code_header: 'HTTP/1.1 200 OK',
        body: JSON.stringify(res),
      };
      this.sendResponse(response);
    }
  }

  validateHostel(input) {
    let error = null;

    if (!input.name) {
      return [false, "Provide a name"];
    }
    if (typeof input.active !== 'boolean') {
      return [false, "Provide a valid active status"];
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

module.exports = HostelController;
