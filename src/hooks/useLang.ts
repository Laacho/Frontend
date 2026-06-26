import { useContext } from 'react';
import { LangContext } from '../contexts/LangContext';

export function useLang() {
  return useContext(LangContext);
}
