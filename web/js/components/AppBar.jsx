import React from 'react';
import AppBar from 'material-ui/AppBar';
import PropTypes from 'prop-types';
import Toolbar from 'material-ui/Toolbar';
import Typography from 'material-ui/Typography';
import IconButton from 'material-ui/IconButton';
import MenuIcon from 'material-ui-icons/Menu';
import { withStyles } from 'material-ui/styles';
import green from 'material-ui/colors/green';
import red from 'material-ui/colors/red';
import Button from 'material-ui/Button';
import colors from '../colors/colors';

const styles = ({
  root: {
    width: '100%',
  },
  flex: {
    flex: 1,
  },
  menuButton: {
    marginLeft: -12,
    marginRight: 20,
    color: '#FFF',
  },
  palette: {
    primary: colors,
    secondary: {
      ...green,
      A400: '#00e677',
    },
    error: red,
    textColor: green,
  },
  appBar: {
    color: '#FFF',
  },
  logoutButton: {
    color: '#FFF',
  },
});

function ButtonAppBar(props) {
  const { classes } = props;
  return (
    <div className={classes.root}>
      <AppBar position="static" className={classes.appBar}>
        <Toolbar>
          <IconButton className={classes.menuButton} color="contrast" aria-label="Menu">
            <MenuIcon />
          </IconButton>
          <Typography type="headline" color="inherit" className={classes.flex}>
            MIWF
          </Typography>
          <Button className={classes.logoutButton} id="logout" href="/logout" color="contrast">Logout</Button>
        </Toolbar>
      </AppBar>
    </div>
  );
}

ButtonAppBar.propTypes = {
  classes: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
};

export default withStyles(styles)(ButtonAppBar);
