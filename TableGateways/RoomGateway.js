class RoomGateway {
    constructor(pool) {
      this.pool = pool;
    }
  
    async findAll(active = null) {
      let query = `
        SELECT r.id, r.name, h.id as hostel_id, h.name as hostel_name, r.active
        FROM hostels h
        LEFT JOIN rooms r ON h.id = r.hostel_id
      `;
  
      if (active === true) {
        query += ' WHERE r.active = true';
      } else if (active === false) {
        query += ' WHERE r.active = false';
      }
  
      try {
        const { rows } = await this.pool.query(query);
        return {
          success: true,
          total: rows.length,
          rooms: rows,
        };
      } catch (error) {
        return {
          success: false,
          message: error.message,
        };
      }
    }
  
    async find(id) {
      const query = `
        SELECT r.id, r.name, h.id as hostel_id, h.name as hostel_name, r.active
        FROM hostels h
        LEFT JOIN rooms r ON h.id = r.hostel_id
        WHERE r.id = $1
      `;
  
      try {
        const { rows } = await this.pool.query(query, [id]);
        if (rows.length > 0) {
          return {
            success: true,
            room: rows,
          };
        } else {
          return {
            success: false,
            message: 'Room not found',
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
      const query = `
        INSERT INTO rooms (name, hostel_id, active)
        VALUES ($1, $2, $3)
        RETURNING id
      `;
  
      try {
        const { rows } = await this.pool.query(query, [input.name, input.hostel_id, input.active]);
        const lastId = rows[0].id;
        const updatedRoom = await this.find(lastId);
        if (updatedRoom.success) {
          return {
            success: true,
            room: updatedRoom.room,
            rowCount: 1,
          };
        } else {
          return {
            success: false,
            message: updatedRoom.message,
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
      const query = `
        UPDATE rooms
        SET name = $1, hostel_id = $2, active = $3
        WHERE id = $4
      `;
  
      try {
        await this.pool.query(query, [input.name, input.hostel_id, input.active, id]);
        const updatedRoom = await this.find(id);
        if (updatedRoom.success) {
          return {
            success: true,
            room: updatedRoom.room,
            rowCount: 1,
          };
        } else {
          return {
            success: false,
            message: updatedRoom.message,
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
      const query = 'DELETE FROM rooms WHERE id = $1';
  
      try {
        const { rowCount } = await this.pool.query(query, [id]);
        return {
          success: true,
          rowCount,
        };
      } catch (error) {
        return {
          success: false,
          message: error.message,
        };
      }
    }
  }
  
  module.exports = RoomGateway;
  