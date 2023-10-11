class StudentGateway {
    constructor(pool) {
      this.pool = pool;
    }
  
    async findAll() {
      const query = `
        SELECT 
          s.id, s.name, s.reg_no, s.email, s.study_year, s.study_semester, s.hostel_id, s.room_id, r.name as room_name, h.name as hostel_name
        FROM students s
        LEFT JOIN hostels h ON h.id = s.hostel_id
        LEFT JOIN rooms r ON s.room_id = r.id
      `;
  
      try {
        const { rows } = await this.pool.query(query);
        return {
          success: true,
          total: rows.length,
          students: rows,
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
        SELECT 
          s.id, s.name, s.reg_no, s.email, s.study_year, s.study_semester, s.hostel_id, s.room_id, r.name as room_name, h.name as hostel_name
        FROM students s
        LEFT JOIN hostels h ON h.id = s.hostel_id
        LEFT JOIN rooms r ON s.room_id = r.id
        WHERE s.id = $1;
      `;
  
      try {
        const { rows } = await this.pool.query(query, [id]);
        if (rows.length > 0) {
          return {
            success: true,
            student: rows,
          };
        } else {
          return {
            success: false,
            message: 'Student not found',
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
      const query = `
        SELECT 
          id, name, reg_no, email, study_year, study_semester, hostel_id, room_id
        FROM students
        WHERE reg_no = $1 AND password = $2;
      `;
  
      try {
        const { rows } = await this.pool.query(query, [input.reg_no, input.password]);
        if (rows.length > 0) {
          return {
            success: true,
            student: rows,
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
      const query = `
        INSERT INTO students 
          (name, reg_no, email, password, study_year, study_semester, hostel_id, room_id)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING id
      `;
  
      try {
        const { rows } = await this.pool.query(query, [
          input.name,
          input.reg_no,
          input.email,
          input.password,
          input.study_year,
          input.study_semester,
          input.hostel_id,
          input.room_id,
        ]);
  
        const lastId = rows[0].id;
        const createdStudent = await this.find(lastId);
  
        if (createdStudent.success) {
          return {
            success: true,
            student: createdStudent.student,
            rowCount: 1,
          };
        } else {
          return {
            success: false,
            message: createdStudent.message,
          };
        }
      } catch (error) {
        return {
          success: false,
          message: error.message,
        };
      }
    }
  
    async updateHostelDetails(id, input) {
      const query = `
        UPDATE students
        SET hostel_id = $1, room_id = $2
        WHERE id = $3;
      `;
  
      try {
        await this.pool.query(query, [input.hostel_id, input.room_id, id]);
        const updatedStudent = await this.find(id);
  
        if (updatedStudent.success) {
          return {
            success: true,
            student: updatedStudent.student,
            rowCount: 1,
          };
        } else {
          return {
            success: false,
            message: updatedStudent.message,
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
      const query = `
        UPDATE students
        SET password = $1
        WHERE id = $2;
      `;
  
      try {
        await this.pool.query(query, [input.password, id]);
        const updatedStudent = await this.find(id);
  
        if (updatedStudent.success) {
          return {
            success: true,
            student: updatedStudent.student,
            rowCount: 1,
          };
        } else {
          return {
            success: false,
            message: updatedStudent.message,
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
        UPDATE students
        SET 
          name = $1, 
          reg_no = $2, 
          email = $3, 
          password = $4, 
          study_year = $5, 
          study_semester = $6, 
          hostel_id = $7, 
          room_id = $8
        WHERE id = $9;
      `;
  
      try {
        await this.pool.query(query, [
          input.name,
          input.reg_no,
          input.email,
          input.password,
          input.study_year,
          input.study_semester,
          input.hostel_id,
          input.room_id,
          id,
        ]);
        const updatedStudent = await this.find(id);
  
        if (updatedStudent.success) {
          return {
            success: true,
            student: updatedStudent.student,
            rowCount: 1,
          };
        } else {
          return {
            success: false,
            message: updatedStudent.message,
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
      const query = 'DELETE FROM students WHERE id = $1';
  
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
  
  module.exports = StudentGateway;
  