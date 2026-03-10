import { TailSpin } from "react-loader-spinner";

const Loader = ({ text = "Loading...", height = 20, width = 20, color = "#00BFFF" }) => {
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <TailSpin height={height} width={width} color={color} />
            <span>{text}</span>
        </div>
    );
};

export default Loader;