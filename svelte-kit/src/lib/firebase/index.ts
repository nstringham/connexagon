import type { User } from 'firebase/auth';
import { NEVER, Observable } from 'rxjs';

export const auth$: Observable<{ auth: User }> = NEVER;
