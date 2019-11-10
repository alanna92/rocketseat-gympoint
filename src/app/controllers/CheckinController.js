import { subDays } from 'date-fns';
import { Op } from 'sequelize';

import Checkin from '../models/Checkin';
import Student from '../models/Student';

class CheckinController {
  async index(req, res) {
    const checkins = await Checkin.findAll({
      where: { student_id: req.params.studentId },
    });
    return res.json(checkins);
  }

  async store(req, res) {
    const { studentId } = req.params;

    const studentExists = await Student.findOne({
      where: { id: studentId },
    });

    if (!studentExists) {
      return res.status(400).json({ error: 'Student not found' });
    }

    const now = new Date();
    const startDateToFind = subDays(now, 7);

    const checkins = await Checkin.findAll({
      where: {
        student_id: studentId,
        created_at: {
          [Op.between]: [startDateToFind, now],
        },
      },
    });

    if (checkins.length === 5) {
      return res
        .status(401)
        .json({ error: 'Student already has 5 checkins in 7 days' });
    }

    const checkin = await Checkin.create({
      student_id: studentId,
    });

    return res.json(checkin);
  }
}

export default new CheckinController();
