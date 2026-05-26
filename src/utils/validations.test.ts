import {
  isAdult,
  isValidEmail,
  isValidFrenchPhone,
  isValidFrenchPostalCode,
  isValidName,
} from './validations';

import { describe, it, expect } from 'vitest';

describe('validations', () => {
  describe('isValidName', () => {
    it('retourne true pour un nom valide', () => {
      expect(isValidName('Dupont')).toBe(true);
      expect(isValidName('Jean-Pierre')).toBe(true);
      expect(isValidName("D'Artagnan")).toBe(true);
      expect(isValidName('Élodie')).toBe(true);
    });

    it('retourne false pour un nom invalide', () => {
      expect(isValidName('')).toBe(false);
      expect(isValidName('A')).toBe(false);
      expect(isValidName('Jean123')).toBe(false);
      expect(isValidName('@Jean')).toBe(false);
    });
  });

  describe('isValidEmail', () => {
    it('retourne true pour un email valide', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
      expect(isValidEmail('john.doe@mail.fr')).toBe(true);
    });

    it('retourne false pour un email invalide', () => {
      expect(isValidEmail('test')).toBe(false);
      expect(isValidEmail('test@')).toBe(false);
      expect(isValidEmail('@example.com')).toBe(false);
      expect(isValidEmail('test@example')).toBe(false);
    });
  });

  describe('isValidFrenchPostalCode', () => {
    it('retourne true pour un code postal français valide', () => {
      expect(isValidFrenchPostalCode('75001')).toBe(true);
      expect(isValidFrenchPostalCode('13008')).toBe(true);
    });

    it('retourne false pour un code postal invalide', () => {
      expect(isValidFrenchPostalCode('7500')).toBe(false);
      expect(isValidFrenchPostalCode('750001')).toBe(false);
      expect(isValidFrenchPostalCode('ABCDE')).toBe(false);
      expect(isValidFrenchPostalCode('75 001')).toBe(false);
    });
  });

  describe('isAdult', () => {
    it('retourne true pour une personne majeure', () => {
      expect(isAdult('1990-01-01')).toBe(true);
    });

    it('retourne false pour une personne mineure', () => {
      expect(isAdult('2020-01-01')).toBe(false);
    });
  });

  describe('isValidFrenchPhone', () => {
    it('retourne true pour un numero francais valide', () => {
      expect(isValidFrenchPhone('0612345678')).toBe(true);
      expect(isValidFrenchPhone('+33 6 12 34 56 78')).toBe(true);
    });

    it('retourne false pour un numero invalide', () => {
      expect(isValidFrenchPhone('75001')).toBe(false);
      expect(isValidFrenchPhone('0012345678')).toBe(false);
    });
  });
});
