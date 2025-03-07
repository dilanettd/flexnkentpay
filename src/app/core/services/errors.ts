import { HttpErrorResponse } from '@angular/common/http';
import { throwError } from 'rxjs';

export const handleHttpError = (err: HttpErrorResponse) => {
  let error: HttpErrorResponse = err;
  if (err.error instanceof ErrorEvent) {
    // A client-side or network error occurred. Handle it accordingly.
    console.error('An error occurred:', err.error.message);
  } else {
    // The backend returned an unsuccessful response code.
    // The response body may contain clues as to what went wrong.
    console.error(
      `Backend returned code ${err.status}, ` + `body was: ${err.error}`
    );
  }
  // Return an observable with a user-facing error message.
  return throwError(error);
};
