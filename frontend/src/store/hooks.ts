import { useDispatch, useSelector } from 'react-redux';
import type { TypedUseSelectorHook } from 'react-redux';
import type { OurRootState, OurAppDispatch } from './store';

// custom typed hooks so we don't have to keep defining the type
export const ourUseDispatch: () => OurAppDispatch = useDispatch;
export const ourUseSelector: TypedUseSelectorHook<OurRootState> = useSelector; 