import React from 'react';
import ReactDOM from 'react-dom';
import _ from "lodash";

//Export default/channel set up
export default function game_init(root, channel) {
  ReactDOM.render(<UnoGame channel={channel} />, root);
}

class UnoGame extends React.Component {
  constructor(props) {
    super(props);

  this.channel = props.channel;

  this.channel
      .join()
      .receive("ok", resp => { console.log("Joined successfully", resp) })
      .receive("error", resp => { console.log("Unable to join", resp) });
  }


  render() {
    return <h1>Hello World</h1>
  }

}
