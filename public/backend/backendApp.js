'use strict';
const e = React.createElement;

class BackendApp extends React.Component {
    constructor(props) {
        super(props);
        this.state = { liked: false };
    }

    render() {
        if (this.state.liked) {
            return 'You liked this.';
        }


        return (<Calendar />
                )

        // e(
        //     'button',
        //     { onClick: () => this.setState({ liked: true }) },
        //     'Like'
        // );
        // <button onClick={() => this.setState({ liked: true })}>
        //             Like
        //         </button>
    }
}

const domContainer = document.querySelector('#backendApp');
ReactDOM.render(e(BackendApp), domContainer);