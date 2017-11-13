// @flow
import React from 'react';
import Dialog, {
  DialogContent,
  DialogTitle,
  DialogActions,
} from 'material-ui/Dialog';
import TextField from 'material-ui/TextField';
import Paper from 'material-ui/Paper';
import Autocomplete from 'react-autocomplete';
import { Range } from 'rc-slider';
import Table, { TableBody, TableCell, TableHead, TableRow } from 'material-ui/Table';
import IconButton from 'material-ui/IconButton';
import DeleteIcon from 'material-ui-icons/DeleteForever';
import AddIcon from 'material-ui-icons/Add';
import Button from 'material-ui/Button';
import 'rc-slider/assets/index.css';

type ChunkList = Array<{id: string, quantity: number, value: number, name: string}>;
type Props = {
  chunks: ChunkList,
  total: number,
  chunkUpdate: ChunkList => void,
  suggestionFieldChange: string => void,
  suggestions: Array<{id: string, name: string, value: number}>,
  saveFunc: () => void,
  cancelFunc: () => void,
}
type State = {
  suggestionText: string,
}

class InvestComposition extends React.Component<Props, State> {
  static makeIntervals(chunks: ChunkList): Array<number> {
    return chunks.reduce((all, v) => {
      all.push(all[all.length - 1] + (v.value * v.quantity));
      return all;
    }, [0]);
  }
  constructor() {
    super();
    this.state = {
      suggestionText: '',
    };
  }
  selectedStock = () => {
    const addition = this.props.suggestions.filter(x => x.name === this.state.suggestionText);
    if (addition.length === 0) {
      return null;
    }
    return addition[0];
  }
  addStock = () => {
    const { chunks } = this.props;
    const addition = this.props.suggestions.filter(x => x.name === this.state.suggestionText);
    if (addition.length === 0) {
      return;
    }
    chunks.push({
      quantity: this.calculateAvailable() / addition[0].value,
      ...addition[0],
    });
    this.setState(() => ({ suggestionText: '' }), () => this.props.suggestionFieldChange(''));
    this.props.chunkUpdate(chunks);
  }
  intervalUpdate = (intervals: Array<number>) => {
    const prevIntervals = InvestComposition.makeIntervals(this.props.chunks);
    let diff = -1;
    for (let i = 0; i < prevIntervals.length; i += 1) {
      if (prevIntervals[i] !== intervals[i]) {
        diff = i;
        break;
      }
    }
    if (diff > 0 && diff < prevIntervals.length) {
      const { chunks } = this.props;
      const cPrev = chunks[diff - 1];
      cPrev.quantity = (intervals[diff] - intervals[diff - 1]) / chunks[diff - 1].value;
      chunks[diff - 1] = cPrev;
      if (diff < prevIntervals.length - 1) {
        const cNext = chunks[diff];
        cNext.quantity = (intervals[diff + 1] - intervals[diff]) / chunks[diff].value;
        chunks[diff] = cNext;
      }
      this.props.chunkUpdate(chunks);
    }
  }
  calculateAvailable = () =>
    this.props.total
    - this.props.chunks.reduce((sum, c) => sum + (c.value * c.quantity), 0)
  deleteChunk = (id: string) => () => {
    const chunks = [...this.props.chunks];
    let index = -1;
    for (let ii = 0; ii < chunks.length; ii += 1) {
      if (chunks[ii].id === id) {
        index = ii;
      }
    }
    if (index >= 0) {
      chunks.splice(index, 1);
    }
    this.props.chunkUpdate(chunks);
  }
  render() {
    const values = InvestComposition.makeIntervals(this.props.chunks);
    const available = this.calculateAvailable();
    const selectedStock = this.selectedStock();
    return (
      <Dialog open>
        <DialogTitle>Edit Composition</DialogTitle>
        <DialogContent>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell padding="dense">Delete</TableCell>
                <TableCell padding="dense">Name</TableCell>
                <TableCell padding="dense">Quantity</TableCell>
                <TableCell padding="dense">Value</TableCell>
                <TableCell padding="dense">Total Value</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {
                this.props.chunks.map(c => (
                  <TableRow key={c.id}>
                    <TableCell padding="dense">
                      <IconButton onClick={this.deleteChunk(c.id)}>
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                    <TableCell padding="dense">
                      {c.name}
                    </TableCell>
                    <TableCell padding="dense" numeric>{c.quantity.toFixed(2)}</TableCell>
                    <TableCell padding="dense" numeric>{c.value}</TableCell>
                    <TableCell padding="dense" numeric>{(c.quantity * c.value).toFixed(2)}</TableCell>
                  </TableRow>
                ))
              }
              <TableRow>
                <TableCell padding="dense">
                  <IconButton onClick={this.addStock}>
                    <AddIcon />
                  </IconButton>
                </TableCell>
                <TableCell padding="dense">
                  <Autocomplete
                    getItemValue={item => item.name}
                    items={this.props.suggestions}
                    renderInput={(props) => {
                      const { ref, ...rest } = props;
                      return (
                        <TextField inputRef={ref} {...rest} />
                      );
                    }
                    }
                    renderItem={(item, isHighlighted) =>
                      (
                        <Paper style={{ background: isHighlighted ? 'lightgray' : 'white' }}>
                          {item.name}
                        </Paper>
                      )
                    }
                    value={this.state.suggestionText}
                    onChange={(e) => {
                      const text = e.target.value;
                      this.setState(() => ({
                        suggestionText: text,
                      }), () => this.props.suggestionFieldChange(text));
                    }}
                    onSelect={(val) => {
                      this.setState(() => ({
                        suggestionText: val,
                      }), () => this.props.suggestionFieldChange(val));
                    }}
                  />
                </TableCell>
                <TableCell padding="dense">
                  {selectedStock ? (available / selectedStock.value).toFixed(2) : null}
                </TableCell>
                <TableCell padding="dense">
                  {selectedStock ? selectedStock.value : null}
                </TableCell>
                <TableCell padding="dense">
                  {selectedStock ? available.toFixed(2) : null}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell padding="dense" />
                <TableCell padding="dense">Available</TableCell>
                <TableCell padding="dense" />
                <TableCell padding="dense" />
                <TableCell padding="dense" numeric>{available.toFixed(2)}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
          <Range
            pushable={false}
            onChange={this.intervalUpdate}
            count={this.props.chunks.length}
            value={values}
            max={this.props.total}
            step={0.01}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={this.props.cancelFunc} color="primary">
            Cancel
          </Button>
          <Button onClick={this.props.saveFunc} color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}

export default InvestComposition;
