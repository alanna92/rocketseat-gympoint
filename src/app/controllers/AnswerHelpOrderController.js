import * as Yup from 'yup';
import HelpOrder from '../models/HelpOrder';
import Student from '../models/Student';
import Queue from '../../lib/Queue';
import AnswerHelpOrderMail from '../jobs/AnswerHelpOrderMail';

class AnswerHelpOrderController {
  async index(req, res) {
    const helpOrders = await HelpOrder.findAll({
      where: { answer: null },
    });
    return res.json(helpOrders);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      answer: Yup.string().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation failed' });
    }

    const { helpOrderId } = req.params;
    const { answer } = req.body;

    const helpOrderExists = await HelpOrder.findOne({
      where: { id: helpOrderId },
    });

    if (!helpOrderExists) {
      return res.status(400).json({ error: 'Help Order not found' });
    }

    let helpOrder = await helpOrderExists.update({
      answer,
      answer_at: new Date(),
    });

    helpOrder = await HelpOrder.findByPk(helpOrder.id, {
      include: [
        {
          model: Student,
          as: 'student',
          attributes: ['id', 'name', 'email'],
        },
      ],
    });

    await Queue.add(AnswerHelpOrderMail.key, {
      helpOrder,
    });

    return res.json(helpOrder);
  }
}

export default new AnswerHelpOrderController();
