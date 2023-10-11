const { Pool } = require('pg'); // Import your PostgreSQL library or modify the import statement accordingly

class HostelGateway {
  constructor() {
    this.pool = new Pool(); // Create a PostgreSQL connection pool
  }

  async findAll() {
    const text = `
      SELECT DISTINCT h.id, h.name, COUNT(r.hostel_id) AS num_rooms, h.active
      FROM rooms r
      LEFT JOIN hostels h ON r.hostel_id = h.id
      GROUP BY h.id
    `;
    try {
      const result = await this.pool.query(text);
      const response = {
        success: true,
        total: result.rowCount,
        hostels: result.rows,
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
    const text = `
      SELECT DISTINCT h.id, h.name, COUNT(r.hostel_id) AS num_rooms, h.active
      FROM rooms r
      LEFT JOIN hostels h ON r.hostel_id = h.id
      WHERE h.id = $1
      GROUP BY h.id
    `;
    try {
      const result = await this.pool.query(text, [id]);
      if (result.rowCount > 0) {
        return {
          success: true,
          hostel: result.rows,
        };
      } else {
        return {
          success: false,
          message: 'Hostel not found',
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
    const text = 'INSERT INTO hostels (name, active) VALUES ($1, $2) RETURNING id';
    try {
      const result = await this.pool.query(text, [input.name, input.active]);
      const lastId = result.rows[0].id;
      const updatedHostel = await this.find(lastId);
      if (updatedHostel.success) {
        return {
          success: true,
          hostel: updatedHostel.hostel,
          rowCount: 1,
        };
      } else {
        return {
          success: false,
          message: updatedHostel.message,
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
    const text = 'UPDATE hostels SET name = $1, active = $2 WHERE id = $3';
    try {
      const result = await this.pool.query(text, [input.name, input.active, id]);
      const updatedHostel = await this.find(id);
      if (updatedHostel.success) {
        return {
          success: true,
          hostel: updatedHostel.hostel,
          rowCount: result.rowCount,
        };
      } else {
        return {
          success: false,
          message: updatedHostel.message,
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
    const text = 'DELETE FROM hostels WHERE id = $1';
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

module.exports = HostelGateway;
