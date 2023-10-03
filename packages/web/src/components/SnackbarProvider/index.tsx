import * as React from 'react';
import {
  SnackbarProvider as BaseSnackbarProvider,
  SnackbarProviderProps,
  closeSnackbar
} from 'notistack';

const SnackbarProvider = (props: SnackbarProviderProps): React.ReactElement => {
  React.useEffect(() => {
    if (process.env['REACT_APP_GLOBAL_SNACKBAR_CLOSE']) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      window.closeSnackbar = closeSnackbar;
    }
  }, []);
  
  return (
    <BaseSnackbarProvider
      {...props}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'right',
      }}
      dense
    />
  );
};

export default SnackbarProvider;
