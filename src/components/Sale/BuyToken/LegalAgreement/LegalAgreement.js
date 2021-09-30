const LegalAgreement = ({ acceptLegualAgreement }) => {
    return (
        <div>
            <p>Legal agreement.</p>
            <button onClick={acceptLegualAgreement}>Accept</button>
        </div>
    );
};

export default LegalAgreement;
