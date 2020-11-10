// import AppError from '@shared/errors/AppError';

import FakeMailProvider from '@shared/container/MailProvider/fakes/FakeMailProvider';
import AppError from '@shared/errors/AppError';
import FakeUsersRepository from '../repositories/fakes/FakeUsersRepository';
import FakeUserTokensRepository from '../repositories/fakes/FakeUserTokensRepository';
import SendForgotPasswordEmail from './SendForgotPasswordEmailService';

let fakeUsersRepository: FakeUsersRepository;
let fakeUserTokensRepository: FakeUserTokensRepository;
let fakeMailProvider: FakeMailProvider;
let sendForgotPasswordEmail: SendForgotPasswordEmail;

describe('SendForgotPasswordEmail', () => {
  beforeEach(() => {
    fakeUsersRepository = new FakeUsersRepository();
    fakeMailProvider = new FakeMailProvider();
    fakeUserTokensRepository = new FakeUserTokensRepository();

    sendForgotPasswordEmail = new SendForgotPasswordEmail(
      fakeUsersRepository,
      fakeMailProvider,
      fakeUserTokensRepository,
    );
  });

  it('should be to recover the password using the email', async () => {
    const sendMail = jest.spyOn(fakeMailProvider, 'sendMail');
    await fakeUsersRepository.create({
      name: 'Victoria',
      email: 'victoria@gmail.com',
      password: '123456',
    });

    await sendForgotPasswordEmail.execute({
      email: 'victoria@gmail.com',
    });

    expect(sendMail).toHaveBeenCalled();
  });

  it('should be to recover the a non-existing user password', async () => {
    await expect(
      sendForgotPasswordEmail.execute({
        email: 'victoria@gmail.com',
      }),
    ).rejects.toBeInstanceOf(AppError);
  });

  it('should generate a forgot password token', async () => {
    const generateToken = jest.spyOn(fakeUserTokensRepository, 'generate');

    const user = await fakeUsersRepository.create({
      name: 'Victoria',
      email: 'victoria@gmail.com',
      password: '123456',
    });

    await sendForgotPasswordEmail.execute({
      email: 'victoria@gmail.com',
    });

    expect(generateToken).toHaveBeenCalledWith(user.id);
  });
});
