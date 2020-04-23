import { getCustomRepository, getRepository } from 'typeorm';
import AppError from '../errors/AppError';

import TransactionRepository from '../repositories/TransactionsRepository';

import Transaction from '../models/Transaction';
import Category from '../models/Category';

interface Request {
  title: string;
  type: 'income' | 'outcome';
  value: number;
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: Request): Promise<Transaction> {
    const transactionRepository = getCustomRepository(TransactionRepository);
    const categoryRepository = getRepository(Category);

    if (type === 'outcome') {
      const { total } = await transactionRepository.getBalance();
      if (total < value) {
        throw new AppError('You do not have enough balance');
      }
    }

    let transactionCategoty = await categoryRepository.findOne({
      where: {
        title: category,
      },
    });

    if (!transactionCategoty) {
      transactionCategoty = await categoryRepository.create({
        title: category,
      });
      await categoryRepository.save(transactionCategoty);
    }

    const transaction = transactionRepository.create({
      title,
      value,
      type,
      category: transactionCategoty,
    });
    await transactionRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
