import * as Yup from 'yup';
import { Op } from 'sequelize';
import { addMonths, parseISO } from 'date-fns';
import Registration from '../models/Registration';
import Plan from '../models/Plan';
import Student from '../models/Student';

class RegistrationController {
  async index(req, res) {
    const regitrations = await Registration.findAll({
      attributes: ['id', 'price', 'start_date', 'end_date'],
      include: [
        {
          model: Plan,
          as: 'plan',
          attributes: ['id', 'title'],
        },
        {
          model: Student,
          as: 'student',
          attributes: ['id', 'name'],
        },
      ],
    });
    return res.json(regitrations);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      student_id: Yup.number().required(),
      plan_id: Yup.number().required(),
      start_date: Yup.date().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation failed' });
    }

    const { plan_id, student_id, start_date } = req.body;

    const plan = await Plan.findByPk(plan_id);

    if (!plan) {
      return res.status(400).json({ error: 'Plan not found' });
    }

    const student = await Student.findByPk(student_id);

    if (!student) {
      return res.status(400).json({ error: 'Student not found' });
    }

    const end_date = addMonths(parseISO(start_date), plan.duration);
    const price = plan.totalPrice;

    const studentRegistration = await Registration.findAll({
      where: {
        student_id,
        [Op.or]: {
          start_date: {
            [Op.between]: [start_date, end_date],
          },
          end_date: {
            [Op.between]: [start_date, end_date],
          },
        },
      },
    });

    if (studentRegistration && studentRegistration.length) {
      return res.status(400).json({
        error: 'Student already has a registration between this period',
      });
    }

    const registration = await Registration.create({
      student_id,
      plan_id,
      start_date,
      end_date,
      price,
    });

    return res.json(registration);
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      student_id: Yup.number().required(),
      plan_id: Yup.number().required(),
      start_date: Yup.date().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation failed' });
    }

    const registration = await Registration.findByPk(req.params.id);

    if (!registration) {
      return res.status(400).json({ error: 'Registration not found' });
    }

    const { plan_id, student_id, start_date } = req.body;

    if (student_id !== registration.student_id) {
      const student = await Student.findByPk(student_id);

      if (!student) {
        return res.status(400).json({ error: 'Student not found' });
      }
    }

    const plan = await Plan.findByPk(plan_id);

    if (!plan) {
      return res.status(400).json({ error: 'Plan not found' });
    }

    const end_date = addMonths(parseISO(start_date), plan.duration);
    const price = plan.totalPrice;

    const studentRegistration = await Registration.findAll({
      where: {
        id: {
          [Op.not]: registration.id,
        },
        student_id,
        [Op.or]: {
          start_date: {
            [Op.between]: [start_date, end_date],
          },
          end_date: {
            [Op.between]: [start_date, end_date],
          },
        },
      },
    });

    if (studentRegistration && studentRegistration.length) {
      return res.status(400).json({
        error: 'Student already has a registration between this period',
      });
    }

    const savedRegistration = await registration.update({
      student_id,
      plan_id,
      start_date,
      end_date,
      price,
    });

    return res.json(savedRegistration);
  }

  async delete(req, res) {
    const registration = await Registration.findByPk(req.params.id);

    if (!registration) {
      return res.status(400).json({ error: 'Registration not found' });
    }

    await registration.destroy();

    return res.json({ message: 'Registration successfully removed' });
  }
}

export default new RegistrationController();
