const RoomGateway = require('./RoomGateway'); // Import your RoomGateway or modify the import statement accordingly

class RoomController {
  constructor(db, requestMethod, roomId, customMethod) {
    this.db = db;
    this.requestMethod = requestMethod;
    this.roomId = roomId;
    this.customMethod = customMethod;

    this.roomGateway = new RoomGateway(db); // Instantiate your RoomGateway
  }

  processRequest() {
    switch (this.requestMethod) {
      case 'GET':
        if (this.roomId) {
          this.getRoom(this.roomId);
        } else {
          this.getAllRooms();
        }
        break;
      case 'POST':
        this.createRoomFromRequest();
        break;
      case 'PUT':
        this.updateRoomFromRequest(this.roomId);
        break;
      case 'DELETE':
        this.deleteRoom(this.roomId);
        break;
      default:
        this.notFoundResponse();
        break;
    }
  }

  getAllRooms() {
    const active = this.customMethod;
    let result;

    if (active === "active") {
      result = this.roomGateway.findAll(true);
    } else if (active === "inactive") {
      result = this.roomGateway.findAll(false);
    } else {
      result = this.roomGateway.findAll();
    }

    const response = {
      status_code_header: 'HTTP/1.1 200 OK',
      body: JSON.stringify(result),
    };

    this.sendResponse(response);
  }

  getRoom(id) {
    const result = this.roomGateway.find(id);

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

  createRoomFromRequest() {
    const input = JSON.parse(req.body);
    const validation = this.validateRoom(input);

    if (!validation[0]) {
      this.unprocessableEntityResponse(validation[1]);
    } else {
      const newRoom = this.roomGateway.insert(input);
      const response = {
        status_code_header: 'HTTP/1.1 201 Created',
        body: JSON.stringify(newRoom),
      };

      this.sendResponse(response);
    }
  }

  updateRoomFromRequest(id) {
    const result = this.roomGateway.find(id);

    if (!result.success) {
      this.notFoundResponse();
    } else {
      const input = JSON.parse(req.body);
      const validation = this.validateRoom(input);

      if (!validation[0]) {
        this.unprocessableEntityResponse(validation[1] || "");
      } else {
        const res = this.roomGateway.update(id, input);
        const response = {
          status_code_header: 'HTTP/1.1 200 OK',
          body: JSON.stringify(res),
        };

        this.sendResponse(response);
      }
    }
  }

  deleteRoom(id) {
    const result = this.roomGateway.find(id);

    if (!result.success) {
      this.notFoundResponse();
    } else {
      const res = this.roomGateway.delete(id);
      const response = {
        status_code_header: 'HTTP/1.1 200 OK',
        body: JSON.stringify(res),
      };

      this.sendResponse(response);
    }
  }

  validateRoom(input) {
    let error = null;

    if (!input.name) {
      return [false, "Provide a room name"];
    }
    if (!input.hostel_id) {
      return [false, "Provide a hostel id"];
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

module.exports = RoomController;
