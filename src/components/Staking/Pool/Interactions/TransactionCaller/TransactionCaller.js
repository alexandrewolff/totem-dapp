import { useState } from "react";

const TransactionCaller = ({ children, action }) => {
    const [value, setValue] = useState("");

    const valueChangeHandler = ({ target }) => {
        const { value } = target;
        setValue(value);
    };

    return (
        <div>
            <input
                value={value}
                onChange={valueChangeHandler}
                placeholder="0.0000"
            />
            <button onClick={() => action(value)}>{children}</button>
        </div>
    );
};

export default TransactionCaller;
