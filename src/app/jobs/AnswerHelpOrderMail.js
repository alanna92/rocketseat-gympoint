import { format, parseISO } from 'date-fns';
import pt from 'date-fns/locale/pt';
import Mail from '../../lib/Mail';

class AnswerHelpOrderMail {
  get key() {
    return 'AnswerHelpOrderMail';
  }

  async handle({ data }) {
    const { helpOrder } = data;

    await Mail.sendMail({
      to: `${helpOrder.student.name} <${helpOrder.student.email}>`,
      subject: 'Resposta recebida',
      template: 'answerHelpOrder',
      context: {
        student: helpOrder.student.name,
        question: helpOrder.question,
        answerAt: format(parseISO(helpOrder.answer_at), 'dd/MM/yyyy', {
          locale: pt,
        }),
        answer: helpOrder.answer,
      },
    });
  }
}

export default new AnswerHelpOrderMail();
