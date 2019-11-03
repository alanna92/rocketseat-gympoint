import { format, parseISO } from 'date-fns';
import pt from 'date-fns/locale/pt';
import Mail from '../../lib/Mail';

class RegistrationMail {
  get key() {
    return 'RegistrationMail';
  }

  async handle({ data }) {
    const { registration } = data;

    await Mail.sendMail({
      to: `${registration.student.name} <${registration.student.email}>`,
      subject: 'Matrícula realizada',
      template: 'registration',
      context: {
        student: registration.student.name,
        plan: registration.plan.title,
        start_date: format(parseISO(registration.start_date), 'dd/MM/yyyy', {
          locale: pt,
        }),
        end_date: format(parseISO(registration.end_date), 'dd/MM/yyyy', {
          locale: pt,
        }),
        price: registration.price,
      },
    });
  }
}

export default new RegistrationMail();
