// @flow
import React from 'react';
import PropTypes from 'prop-types';
import Button from 'material-ui/Button';
import TextField from 'material-ui/TextField';
import Dialog, {
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from 'material-ui/Dialog';
import Checkbox from 'material-ui/Checkbox';
import { FormGroup, FormControlLabel } from 'material-ui/Form';

type Props = {
  cancel: () => void,
  save: (string, bool, number) => void,
  errors?: ?Array<Error>,
}
type State = {
  public: bool,
  bucketName: string,
  investment: number,
}

export default class EditBucket extends React.Component<Props, State> {
  static propTypes = {
    cancel: PropTypes.func.isRequired,
    save: PropTypes.func.isRequired,
  }
  constructor() {
    super();
    this.state = {
      public: false,
      bucketName: '',
      investment: 1000,
    };
  }
  clickCheckbox = () => this.setState(state => ({
    ...state,
    public: !state.public,
  }))
  bucketNameChange = (e: SyntheticInputEvent<>) => {
    const text = e.target.value;
    this.setState(() => ({
      bucketName: text,
    }));
  }
  investmentChange = (e: SyntheticInputEvent<>) => {
    const investment = parseFloat(e.target.value);
    this.setState(() => ({
      investment,
    }));
  }
  save = () => {
    this.props.save(this.state.bucketName, this.state.public, this.state.investment);
  }
  render() {
    return (
      <Dialog open onRequestClose={this.props.cancel}>
        <DialogTitle>Subscribe</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Create a new risk bucket that people can invest in
          </DialogContentText>
          {
            this.props.errors ? this.props.errors.map(e => (
              <DialogContentText key={e.message}>{e.message}</DialogContentText>
            )) : null
          }
          <FormGroup row>
            <TextField
              autoFocus
              margin="dense"
              id="name"
              label="Bucket name"
              type="text"
              value={this.state.bucketName}
              onChange={this.bucketNameChange}
              fullWidth
            />
          </FormGroup>
          <FormGroup row>
            <TextField
              autoFocus
              margin="dense"
              id="investment"
              label="Investment"
              type="text"
              value={this.state.investment.toFixed(2)}
              onChange={this.investmentChange}
              fullWidth
            />
          </FormGroup>
          <FormGroup row>
            <FormControlLabel
              id="publicContainer"
              control={
                <Checkbox
                  id="public"
                  checked={this.state.public}
                  onChange={this.clickCheckbox}
                />
              }
              label="Public"
            />
          </FormGroup>
        </DialogContent>
        <DialogActions>
          <Button id="cancel" onClick={this.props.cancel} color="primary">
            Cancel
          </Button>
          <Button id="save" onClick={this.save} color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}
