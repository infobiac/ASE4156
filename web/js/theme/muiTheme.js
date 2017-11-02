import { createMuiTheme } from 'material-ui/styles';
import green from 'material-ui/colors/green';
import red from 'material-ui/colors/red';
import 'typeface-roboto/index.css';
import colors from '../colors/colors';

const theme = createMuiTheme({
  typography: {
    fontFamily: 'Roboto-Light',
  },
  palette: {
    primary: colors,
    secondary: {
      ...green,
      A400: '#fff',
    },
    error: red,
    textColor: green,
  },
  appBar: {
    textColor: green,
    height: 60,
  },
  root: {
    marginTop: 30,
    width: '100%',
  },
  flex: {
    flex: 1,
  },
  menuButton: {
    marginLeft: -12,
    marginRight: 20,
  },
});

export default theme;
