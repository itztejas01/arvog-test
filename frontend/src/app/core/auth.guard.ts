import { inject } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { CanActivateFn, Router } from '@angular/router';
import { filter, map, take } from 'rxjs/operators';
import { AuthService } from './auth.service';

function whenSessionReady<T>(run: (auth: AuthService) => T) {
  const auth = inject(AuthService);
  return toObservable(auth.sessionReady).pipe(
    filter((ready) => ready),
    take(1),
    map(() => run(auth)),
  );
}

export const authGuard: CanActivateFn = () => {
  const router = inject(Router);
  return whenSessionReady((auth) =>
    auth.isLoggedIn() ? true : router.createUrlTree(['/login']),
  );
};

export const guestGuard: CanActivateFn = () => {
  const router = inject(Router);
  return whenSessionReady((auth) =>
    !auth.isLoggedIn() ? true : router.createUrlTree(['/']),
  );
};
