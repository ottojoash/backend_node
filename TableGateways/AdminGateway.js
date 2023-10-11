const { Pool } = require('pg'); // Import your PostgreSQL library or modify the import statement accordingly

class AdminGateway {
  constructor() {
    this.pool = new Pool(); // Create a PostgreSQL connection pool
  }

  async findAll() {
    const text = 'SELECT id, username, email, password FROM admins';
    try {
      const result = await this.pool.query(text);
      const response = {
        success: true,
        total: result.rowCount,
        admins: result.rows,
      };
      return response;
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  async find(id) {
    const text = 'SELECT id, name, username, email, password FROM admins WHERE id = $1';
    try {
      const result = await this.pool.query(text, [id]);
      if (result.rowCount > 0) {
        return {
          success: true,
          admin: result.rows,
        };
      } else {
        return {
          success: false,
          message: 'Admin not found',
        };
      }
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  async login(input) {
    const text = 'SELECT id, name, username, email FROM admins WHERE email = $1 AND password = $2';
    try {
      const result = await this.pool.query(text, [input.email, input.password]);
      if (result.rowCount > 0) {
        return {
          success: true,
          admin: result.rows,
        };
      } else {
        return {
          success: false,
          message: 'Invalid login details',
        };
      }
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  async insert(input) {
    const text = 'INSERT INTO admins (username, email, password) VALUES ($1, $2, $3) RETURNING id';
    try {
      const result = await this.pool.query(text, [input.username, input.email, input.password]);
      const lastId = result.rows[0].id;
      const createdAdmin = await this.find(lastId);
      if (createdAdmin.success) {
        return {
          success: true,
          admin: createdAdmin.admin,
          rowCount: 1,
        };
      } else {
        return {
          success: false,
          message: createdAdmin.message,
        };
      }
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  async update(id, input) {
    const text = 'UPDATE admins SET name = $1, email = $2 WHERE id = $3';
    try {
      const result = await this.pool.query(text, [input.name, input.email, id]);
      const updatedAdmin = await this.find(id);
      if (updatedAdmin.success) {
        return {
          success: true,
          admin: updatedAdmin.admin,
          rowCount: result.rowCount,
        };
      } else {
        return {
          success: false,
          message: updatedAdmin.message,
        };
      }
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  async updatePassword(id, input) {
    const text = 'UPDATE admins SET password = $1 WHERE id = $2';
    try {
      const result = await this.pool.query(text, [input.password, id]);
      const updatedAdmin = await this.find(id);
      if (updatedAdmin.success) {
        return {
          success: true,
          admin: updatedAdmin.admin,
          rowCount: result.rowCount,
        };
      } else {
        return {
          success: false,
          message: updatedAdmin.message,
        };
      }
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  async delete(id) {
    const text = 'DELETE FROM admins WHERE id = $1';
    try {
      const result = await this.pool.query(text, [id]);
      return {
        success: true,
        rowCount: result.rowCount,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }
}

module.exports = AdminGateway;
