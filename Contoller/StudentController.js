const StudentGateway = require('./StudentGateway'); // Import your StudentGateway or modify the import statement accordingly

class StudentController {
  constructor(db, requestMethod, studentId, customMethod) {
    this.db = db;
    this.requestMethod = requestMethod;
    this.customMethod = customMethod;
    this.studentId = studentId;

    this.studentGateway = new StudentGateway(db); // Instantiate your StudentGateway
  }

  processRequest() {
    switch (this.requestMethod) {
      case 'GET':
        if (this.studentId) {
          this.getStudent(this.studentId);
        } else if (this.customMethod) {
          this.unprocessableEntityResponse(`Cannot get ${this.customMethod}`);
        } else {
          this.getAllStudents();
        }
        break;
      case 'POST':
        if (this.customMethod === "login") this.updateStudentFromRequest(this.studentId, "login");
        else this.createStudentFromRequest();
        break;
      case 'PUT':
        this.updateStudentFromRequest(this.studentId, this.customMethod);
        break;
      case 'DELETE':
        this.deleteStudent(this.studentId);
        break;
      default:
        this.notFoundResponse();
        break;
    }
  }

  getAllStudents() {
    const result = this.studentGateway.findAll();
    const response = {
      status_code_header: 'HTTP/1.1 200 OK',
      body: JSON.stringify(result),
    };
    this.sendResponse(response);
  }

  getStudent(id) {
    const result = this.studentGateway.find(id);

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

  createStudentFromRequest() {
    const input = JSON.parse(req.body);
    const validation = this.validateStudent(input);

    if (!validation[0]) {
      this.unprocessableEntityResponse(validation[1]);
    } else {
      const newStudent = this.studentGateway.insert(input);
      const response = {
        status_code_header: 'HTTP/1.1 201 Created',
        body: JSON.stringify(newStudent),
      };
      this.sendResponse(response);
    }
  }

  updateStudentFromRequest(id, updateType = null) {
    const result = this.studentGateway.find(id);

    if (!result.success) {
      this.notFoundResponse();
    } else {
      const input = JSON.parse(req.body);
      const validation = updateType === "login"
        ? this.validateStudentLogin(input)
        : this.validateStudent(input, false);

      if (!validation[0]) {
        this.unprocessableEntityResponse(validation[1] || "");
      } else {
        const res = updateType === "login"
          ? this.studentGateway.login(input)
          : (updateType === "updateHostelDetails"
            ? this.studentGateway.updateHostelDetails(id, input)
            : (updateType === "updatePassword"
              ? this.studentGateway.updatePassword(id, input)
              : this.studentGateway.update(id, input)));
        const response = {
          status_code_header: 'HTTP/1.1 200 OK',
          body: JSON.stringify(res),
        };
        this.sendResponse(response);
      }
    }
  }

  deleteStudent(id) {
    const result = this.studentGateway.find(id);

    if (!result.success) {
      this.notFoundResponse();
    } else {
      const res = this.studentGateway.delete(id);
      const response = {
        status_code_header: 'HTTP/1.1 200 OK',
        body: JSON.stringify(res),
      };
      this.sendResponse(response);
    }
  }

  validateStudent(input, isNew = true) {
    let error = null;

    if (!input.reg_no) {
      return [false, "Provide a reg number"];
    }
    if (!input.password && isNew) {
      return [false, "Provide a password"];
    }
    if (!input.name && isNew) {
      return [false, "Provide a name"];
    }
    return [error == null, error];
  }

  validateStudentLogin(input) {
    let error = null;

    if (!input.reg_no) {
      return [false, "Provide a reg number"];
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

module.exports = StudentController;
