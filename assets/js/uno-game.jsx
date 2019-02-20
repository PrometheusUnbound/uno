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
    this.state = {
      playerid: -1,
      hand: [],
      opp_hands: [],
      face_up: [],
    }

  this.channel = props.channel;

  this.channel
      .join()
      .receive("ok", resp => { console.log("Joined successfully", resp) })
      .receive("error", resp => { console.log("Unable to join", resp) });
  }

  got_view(view) {
    console.log("new view", view);
    this.setState(view.game);
  }

  on_play(ev){
    this.channel.push("play_card", { playerid: playerid },
    { card: ev.target.value })
        .receive("ok", this.got_view.bind(this));
  }

  on_draw(ev){
    this.channel.push("draw_card", { playerid: playerid })
      .recieve("ok", this.got_view.bind(this));
  }

  on_uno(){
    this.channel.push("uno?", { hand: hand })
      .recieve("ok", this.got_view.bind(this))
  }

  creatHand(){
    let table = [];
    for(let i = 0; j < 1; j++){
      let children = [];
      for(let j = 0; i < hand.length; j++) {
        children.push(<td>{'${hand[j][0] + " " + hand[j][1]'}</td>);
      }
      table.push(<tr>{children}</tr>);
    }
    return table;
  }




  render() {
    let uno_button = <button className="button uno" onClick={() => this.on_uno()}>
                      UNO!</button>
    return (
      <div>
        <div className="row">
          <div className="column">
            {uno_button}
          </div>
        </div>
        <div className="row">
          <div className="column">
            <Face face={this.state.face_up} />
          </div>
          <div className="column">
            <img src='/images/UNO-Back.png'
                      onClick={() => this.on_draw.bind(this)} />
          </div>
        </div>
      </div>
    )
  }
}

function Face(params) {
  let {face} = params;
  return (
    <div>
      <p><b>The Deck</b></p>
    </div>
  );
}
