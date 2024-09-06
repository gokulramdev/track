import { EditorState } from "prosemirror-state";
import { ProseMirror } from "@nytimes/react-prosemirror";
import { useState } from "react";
import { baseKeymap } from "prosemirror-commands";
import { keymap } from "prosemirror-keymap";
import { DOMParser } from "prosemirror-model";
import Header from './Header'
import { schema } from "./Schemas";
import { amendTransaction } from "./trackChanges.js";  // Import the existing functions
import { chainCommands, deleteSelection, joinBackward, selectNodeBackward } from "prosemirror-commands"
import { undo, redo, history } from "prosemirror-history"
import { buildKeymap } from "prosemirror-example-setup"

const backspace = chainCommands(deleteSelection, joinBackward, selectNodeBackward)
const addInputType = (tr, inputType) => tr.setMeta("inputType", inputType)

const keymapPlugin = keymap({
    "Backspace": (state, dispatch, view) => backspace(state, tr => dispatch(addInputType(tr, "deleteContentBackward")), view),
    "Mod-z": (state, dispatch, view) => undo(state, tr => dispatch(addInputType(tr, "historyUndo")), view),
    "Shift-Mod-z": (state, dispatch, view) => redo(state, tr => dispatch(addInputType(tr, "historyRedo")), view),
    // ...baseKeymap,

});


// Sample data as a string in Markdown or HTML
const sampleData = "<p>Hello, this is a <strong>ProseMirror</strong> editor!</p>";

// Convert sample data to a ProseMirror document
const tempElement = document.createElement('div');
tempElement.innerHTML = sampleData;
const doc = DOMParser.fromSchema(schema).parse(tempElement);



function ProseMirrorEditor() {
    const [mount, setMount] = useState(null);

    const user = { id: "user1", username: "Editor1" };  // Simulate user information
    const editor = { clientTimeAdjustment: 0, docInfo: { access_rights: ["write-tracked"] } }; // Simulate editor environment

    const [state, setState] = useState(EditorState.create({
        doc: doc,
        schema,
        plugins: [
            history(),
            keymapPlugin,
            keymap(buildKeymap)
            // createTrackingPlugin(user, editor),

        ]
    }));

    const dispatchTransaction = (tr) => {
        const amendedTransaction = amendTransaction(tr, state, { id: "user1", username: "Editor1" });
        setState((s) => s.apply(amendedTransaction));
    };


    return (
        <ProseMirror
            mount={mount}
            state={state}
            dispatchTransaction={dispatchTransaction}
        >
            <Header />
            <div ref={setMount} />
        </ProseMirror>
    );
}

export default ProseMirrorEditor