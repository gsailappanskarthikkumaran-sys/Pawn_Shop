import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { Printer, ArrowLeft, X } from 'lucide-react';
import './Print.css';

const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    const filename = path.split(/[/\\]/).pop();
    return `http://localhost:5000/src/uploads/${filename}`;
};

const PrintView = () => {
    const { type, id } = useParams();
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    const hasPrinted = useRef(false);

    useEffect(() => {
        fetchData();
        // Reset hasPrinted when id/type changes
        return () => { hasPrinted.current = false; };
    }, [type, id]);

    const fetchData = async () => {
        try {
            let endpoint = '';
            if (type === 'loan') endpoint = `/loans/${id}`;
            else if (type === 'customer') endpoint = `/customers/${id}`;
            else if (type === 'payment') endpoint = `/payments/${id}`;
            else if (type === 'day-book') {
                const { data } = await api.get(`/reports/day-book?date=${id}`);
                setData(data);
                if (!hasPrinted.current) {
                    hasPrinted.current = true;
                    setTimeout(() => window.print(), 500);
                }
                return;
            }
            else if (type === 'report-demand') {
                const { data } = await api.get('/reports/demand');
                setData(data);
                if (!hasPrinted.current) {
                    hasPrinted.current = true;
                    setTimeout(() => window.print(), 500);
                }
                return;
            }
            else if (type === 'mini-statement') {
                const [loanRes, paymentsRes] = await Promise.all([
                    api.get(`/loans/${id}`),
                    api.get(`/payments/loan/${id}`)
                ]);
                setData({ loan: loanRes.data, payments: paymentsRes.data });
                if (!hasPrinted.current) {
                    hasPrinted.current = true;
                    setTimeout(() => window.print(), 500);
                }
                return;
            }

            if (endpoint) {
                const { data } = await api.get(endpoint);
                setData(data);

                if (!hasPrinted.current) {
                    hasPrinted.current = true;
                    setTimeout(() => {
                        window.print();
                    }, 500);
                }
            }
        } catch (error) {
            console.error("Print fetch error", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="text-center p-10">Preparing document...</div>;
    if (!data) return <div className="text-center p-10">Document not found.</div>;

    return (
        <div className="print-layout">
            <img src={getImageUrl('watermark.png')} className="watermark-img" alt="Company Watermark" />
            <div className="screen-controls">
                <button onClick={() => window.close()} className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded hover:bg-gray-200">
                    <X size={16} /> Close
                </button>
                <button onClick={() => window.print()} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                    <Printer size={16} /> Print
                </button>
            </div>

            <div className="paper-sheet">
                <div className="print-header">
                    <div className="company-name bold mono">MAHES BANKERS</div>
                    <div className="company-details mono">
                        2005/1 – PKN ROAD, SIVAKASI – 626123<br />
                        LICENCE NO: TN-2020230415119<br />
                        PHONE: 8838543387, 9791624169
                    </div>
                </div>


                {type === 'loan' && (
                    <>
                        <LoanReceipt loan={data} />
                        <TermsAndConditions />
                    </>
                )}
                {type === 'customer' && <CustomerProfile customer={data} />}
                {type === 'payment' && <PaymentReceipt payment={data} />}
                {type === 'day-book' && <DayBookReport data={data} date={id} />}
                {type === 'report-demand' && <DemandReport report={data} />}
                {type === 'mini-statement' && <MiniStatement data={data} />}
            </div>
        </div>
    );
};


const LoanReceipt = ({ loan }) => (
    <div className="loan-receipt-v2 mono uppercase">
        <h2 className="document-title bold">ACKNOWLEDGEMENT CUM RECEIPT</h2>

        {/* 1. Transaction Header */}
        <div className="banking-box">
            <div className="grid-2">
                <div>
                    <div>DATE : <span className="bold">{new Date(loan.createdAt).toLocaleDateString()}</span></div>
                    <div>RECEIPT NO : <span className="bold">{loan._id.substring(loan._id.length - 8).toUpperCase()}</span></div>
                    <div>COVER NO : ________________</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <div>LOAN NO : <span className="bold">{loan.loanId}</span></div>
                    <div>LOAN PERIOD : <span className="bold">{loan.scheme?.tenureMonths || 12} MONTHS</span></div>
                    <div>MAX SANCTIONED AMOUNT/GMS : ________________</div>
                </div>
            </div>
        </div>

        {/* 2. Borrower Details */}
        <div className="banking-box">
            <div className="bold border-b mb-2">BORROWER DETAILS</div>
            <div className="grid-2">
                <div>
                    <div>NAME : <span className="bold">MR / MS {loan.customer?.name}</span></div>
                    <div>ADDRESS : <span className="bold">{loan.customer?.address}, {loan.customer?.city}</span></div>
                </div>
                <div className="photo-column">
                    {loan.customer?.photo && (
                        <img src={getImageUrl(loan.customer.photo)} alt="Customer" className="customer-photo" />
                    )}
                    <div>PHONE NO : <span className="bold">{loan.customer?.phone}</span></div>
                    <div>DATE OF BIRTH : <span className="bold">{loan.customer?.dob ? new Date(loan.customer.dob).toLocaleDateString() : '________________'}</span></div>
                </div>
            </div>
        </div>

        {/* 3. Loan Declaration (Tamil) */}
        <div className="tamil-text" style={{ fontSize: '9px', lineHeight: '1.4' }}>
            மேற்கண்ட முகவரியில் வசிக்கும் நான் எனது கைவசமுள்ள தனிச் சொத்தான நகைகளை உங்களுக்கு அடகு வைத்து கடன் பெற்றுள்ளேன். நகைகள் விவரம் கீழே கொடுக்கப்பட்டுள்ளது. நகைகளில் வைக்கப்பட்டுள்ள கற்களுக்கு மதிப்பு கிடையாது. இந்த அடமானத்திற்குரிய அசல் மற்றும் வட்டியை நிர்ணயிக்கப்பட்ட காலத்திற்குள் அல்லது உங்களால் கேட்கப்படும் போது செலுத்துகிறேன் என்று உறுதி கூறுகிறேன். நிறுவனத்தின் இதர விதிகள் மற்றும் நிபந்தனைகளுக்கு நான் கட்டுப்படுகிறேன். அடகு வைக்கப்படும் நகைகள் என்னுடையதே என்று உறுதி அளிக்கிறேன்.
        </div>

        {/* 4. Jewellery Details Table */}
        <table className="border-all">
            <thead>
                <tr>
                    <th>ITEM DESCRIPTION</th>
                    <th style={{ textAlign: 'center' }}>GROSS WT</th>
                    <th style={{ textAlign: 'center' }}>NET WT</th>
                    <th style={{ textAlign: 'center' }}>INTEREST %</th>
                </tr>
            </thead>
            <tbody>
                {loan.items?.map((item, index) => (
                    <tr key={index}>
                        <td className="bold">{item.name || 'GOLD ITEM'} - {item.description || ''}</td>
                        <td style={{ textAlign: 'center' }}>{item.grossWeight}G</td>
                        <td style={{ textAlign: 'center' }}>{item.netWeight}G</td>
                        <td style={{ textAlign: 'center' }}>{loan.interestRate}%</td>
                    </tr>
                ))}
            </tbody>
        </table>
        <div className="mb-4">
            <div>SCHEME : <span className="bold">{loan.scheme?.schemeName || 'AGL – ONE YEAR'}</span></div>
            <div>INTEREST RATE FOR THE PERIOD : <span className="bold">{loan.interestRate}% PM</span></div>
        </div>

        {/* 5. Office Use Section */}
        <div className="banking-box">
            <div className="bold border-b mb-2">OFFICE USE SECTION</div>
            <div className="grid-2">
                <div>
                    <div>APPRAISED BY : ________________</div>
                    <div>KYC VERIFIED : <span className="bold">YES</span></div>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <div>LOAN AMOUNT DISBURSED : <span className="bold">RS. {loan.loanAmount}</span></div>
                    {loan.preInterestAmount > 0 && (
                        <div>PRE-INTEREST COLLECTED : <span className="bold">RS. {loan.preInterestAmount}</span></div>
                    )}
                </div>
            </div>
            <div className="footer" style={{ border: 'none', marginTop: '10px' }}>
                <div className="signature-box" style={{ width: '220px' }}>
                    <div className="signature-line"></div>
                    APPRAISER SIGNATURE
                </div>
                <div className="signature-box" style={{ width: '220px' }}>
                    <div className="signature-line"></div>
                    OFFICE IN-CHARGE SIGNATURE
                </div>
            </div>
        </div>

        {/* 6. Acknowledgement */}
        <div className="mb-4 mt-2">
            <div className="bold">ACKNOWLEDGEMENT:</div>
            <div>“I HAVE RECEIVED THE PLEDGED JEWELLERY IN GOOD CONDITION.”</div>
            <div className="grid-2 mt-4">
                <div>BORROWER SIGNATURE : ________________</div>
                <div style={{ textAlign: 'right' }}>DATE : ________________</div>
            </div>
        </div>

        {/* 7. Nomination Section (Tamil) */}
        <div className="banking-box">
            <div className="bold border-b mb-1">வாரிசுதாரர் விபரம் (NOMINATION)</div>
            <div className="tamil-text" style={{ fontSize: '9px', marginBottom: '5px' }}>
                வாரிசுதாரர் பெயர் : <span className="bold">{loan.customer?.nominee || '________________'}</span> | உறவு : ________________ | வயது : ________________ (மேஜர்)<br />
                எனது மரணத்திற்குப் பிறகு இந்த அடமானச் சீட்டில் குறிப்பிட்டுள்ள நகைகளை பெற்றுக்கொள்ள மேற்கண்ட வாரிசுதாரரை நியமிக்கிறேன். இந்த நியமனம் மற்ற அனைத்து உயில் மற்றும் சட்ட ஆவணங்களை விட மேலானது என்று நான் உறுதி கூறுகிறேன்.
            </div>
            <div className="text-right mt-2" style={{ fontSize: '10px' }}>
                கடன் வாங்குபவர் கையொப்பம் : ________________
            </div>
        </div>

        {/* Terms and Conditions Reference */}
        <div className="text-center bold mt-4" style={{ fontSize: '10px' }}>
            “TERMS AND CONDITIONS (TAMIL & ENGLISH) ARE PRINTED ON THE REVERSE SIDE AND FORM PART OF THIS RECEIPT.”
        </div>

        {/* 9. Footer Signature */}
        <div className="footer">
            <div className="signature-box" style={{ width: '100%', textAlign: 'right' }}>
                <div style={{ marginBottom: '40px' }}></div>
                BORROWER’S SIGNATURE : ________________
            </div>
        </div>
    </div>
);

const TermsAndConditions = () => (
    <div className="terms-conditions-page mono">
        <div className="terms-section">
            <h3 className="bold">விதிமுறைகள் மற்றும் நிபந்தனைகள்</h3>
            <ul className="terms-list">
                <li><span>1.</span><span>கடன் 7 நாட்கள் முன்பு மூடப்பட்டால்; குறைந்தபட்ச காலம் 15 நாட்களுக்கான வட்டி வசூலிக்கப்படும்.</span></li>
                <li><span>2.</span><span>பிராமிசரி நோட்டில் குறிப்பிடப்பட்ட வட்டி விதிகளையும், அவ்வப்போது நிர்வாகம் நிர்ணயிக்கும் மற்ற கட்டணங்களையும் கடன் பெறுபவர் செலுத்த வேண்டும்.</span></li>
                <li><span>3.</span><span>தவறும் பட்சத்தில் கடனுக்கு அடமானமாக கொடுக்கப்பட்ட பொருட்களை, இந்தக் கடனுக்கோ அல்லது கடன் பெறுபவரிடமிருந்து நிர்வாகத்துக்கு சேர வேண்டிய மற்ற தொகைகளுக்காகவோ, தக்கவைத்துக் கொள்ள நிர்வாகத்திற்கு உரிமை உண்டு.</span></li>
                <li><span>4.</span><span>நிர்வாகத்திற்கு சாதகமாக கடன் பெறுபவர் எழுதிக் கொடுத்த ஒப்பந்தம் மற்றும் பிற ஆவணங்களை எப்போதும் வேண்டுமானாலும், ஏனைய வங்கி மற்றும் நிதி நிறுவனங்களுக்கு மாற்றம் செய்து பணம் பெற்றுக் கொள்ள நிர்வாகத்திற்கு உரிமை உண்டு.</span></li>
                <li><span>5.</span><span>அடமானம் பெற்ற நகைகளை நிர்வாக அலுவலர்களோ அல்லது தணிக்கை அதிகாரிகளோ தரத்தைக் சோதித்துப் பார்ப்பதற்கு முழு அதிகாரம் உண்டு.</span></li>
                <li><span>6.</span><span>நகைக்கடன் பெறுவது, வட்டி செலுத்துவது, திருப்புவது ஆகிய காரியங்களை அலுவலக வேலை நேரத்தில் மட்டுமே செய்து கொள்ள முடியும். எந்தவொரு தவணை தேதியும் விடுமுறை நாளன்று வருமானால், விடுமுறைக்கு முந்திய வேலை நாள் தவணை தேதியாக எடுத்துக் கொள்ளப்படும்.</span></li>
                <li><span>7.</span><span>கடன் மற்றும் வட்டியை கடன் பெறுபவரோ அல்லது அவரால் அதிகாரம் பெற்றவர்களோ திருப்பிச் செலுத்த முடியும். கடன் பெறுபவரோ அல்லது அவரால் எழுத்துமூலம் அதிகாரம் பெற்றவரோ அசல் மற்றும் வட்டியை திருப்பிச் செலுத்தி அடகு சீட்டை கொடுக்கும் பட்சத்தில் நகையை திருப்பிக் கொள்ளலாம். கடன் பெறுபவர் வாரிசுதாரர்களை நியமிக்காதபடி இருந்தால், மேற்கண்ட நகைகள் சட்டப்படி உரிய தொகையை பெற்ற பிற்பாடு ஒப்படைக்கப்படும்.</span></li>
                <li><span>8.</span><span>சட்டவிரோத காரியங்களுக்கு இந்தக் கடன் பயன்படுத்தப்பட மாட்டாது என்பதை கடன் பெறுபவர் உறுதி செய்கிறார்.</span></li>
                <li><span>9.</span><span>கடனில் பகுதி தொகை மட்டும் செலுத்தும் பட்சத்தில், முதலில் வட்டி கழிக்கப்பட்டு, எஞ்சிய தொகை மட்டுமே அசலில் வரவு வைக்கப்படும்.</span></li>
                <li><span>10.</span><span>முகவரி மாற்றத்தை நிர்வாகத்திற்கு எழுத்து மூலம் கொடுத்து ஒப்புதல் பெற்றுக் கொள்ள வேண்டும். இல்லையெனில், வாடிக்கையாளர்கள் விண்ணப்பப் படிவத்தில் தெரிவிக்கப்பட்ட முகவரி மட்டுமே அனைத்து விதமான காரியங்களுக்கும் பயன்படுத்திக் கொள்ளப்படும்.</span></li>
                <li><span>11.</span><span>அடமானம் வைக்கப்பட்ட நகை கடன் பெறுபவருக்குச் சொந்தமானதாகும். மற்றவர்கள் யாரும் அதன்மீது உரிமை கொண்டாட இயலாது. இதை அடமான செலவு மற்றும் பின்ன்விளைவுகளிலிருந்து பாதுகாக்க வேண்டும்.</span></li>
                <li><span>12.</span><span>பிராமிசரி நோட்டில் குறிப்பிடப்பட்ட கடன் காலம் காலாவதியானதற்குள் அல்லது நிர்வாகம் சொன்ன தேதியிலோ கடன் பெற்றவர் முழுத் தொகையையும் செலுத்தத் தவறினால், அடமானம் வைக்கப்பட்ட நகைகளை நிர்வாகம், 2 வார கால நோட்டீஸ் கொடுத்த பிறகு விற்கும். நகை விற்பனைக்குப் பற்றாக்குறை இருப்பின், அது கடன் பெறுபவரிடமிருந்து வசூலிக்கப்படும். உபரியாக இருக்கும் பட்சத்தில், நிர்வாகத்திற்கு சேர வேண்டிய நகைக்கடன் தொகைகளை நிர்வாகம் எடுத்துக் கொள்ளும். ஏதேனும் உபரி தொகை இருப்பின், 30 நாட்களுக்குள் வழங்கப்படும்.</span></li>
                <li><span>13.</span><span>தங்க நகைகள் கொடுப்பது, வட்டியுடன் வசூல் செய்வது, பிணையமாக வைக்கப்பட்டுள்ளவற்றை விற்றுப் பணமாக்குவது, இவற்றுக்கான செலவுகள், அரசாங்கத்திற்கு செலுத்த வேண்டிய வரி மற்றும் இதர செலவினங்கள், நிர்வாகச் செலவு, வட்டி வரி, சேவை வரி, பத்திரச் செலவு, விற்பனை வரி, மதிப்புக்கூட்டும் வரி முதலியவற்றை கடன் பெறுபவர் ஏற்றுக் கொள்ள வேண்டும் அல்லது அவற்றை நிர்வாகத்திற்கு செலுத்த வேண்டும்.</span></li>
                <li><span>14.</span><span>எதிர்பாராத சூழ்நிலை காரணமாக அடமானம் வைக்கப்பட்ட நகைகளுக்கு சேதாரம் ஏற்பட்டால், அடமான ரசீதில் குறிப்பிடப்பட்ட எடைக்கு சமமான நகையை நிர்வாகம் கொடுக்கும் அல்லது அந்த எடைக்கு சமமான மார்க்கெட் நிலவர மதிப்பின் படி தொகையை கொடுக்கும். இவ்வாறு இழப்பீட்டுத் தொகை பெறுவதற்கு முன், நிர்வாகத்திற்கு சேர வேண்டிய அசல், வட்டி மற்றும் இதர செலவுகளை நேர்செய்ய வேண்டியது கட்டாயமாகும்.</span></li>
                <li><span>15.</span><span>கடன் பெறுபவர் தெரிவிக்கும் தங்கத்தின் தரத்தினை அப்படியே ஏற்றுக் கொண்டு கடன் வழங்கப்படுகிறது. பின்னாளில் மேற்கண்ட நகை தரம் குறைந்தது அல்லது போலியானது என்று கண்டுபிடிக்கப்பட்டால், கடன் பெறுபவர்மீது கிரிமினல் வழக்கு தொடரப்பட்டு கடன் வசூலிக்கப்படும். இதற்காகும் செலவுகளுக்கெல்லாம் கடன் பெறுபவரே பொறுப்பாவார்.</span></li>
                <li><span>16.</span><span>நிர்வாகம் கொடுத்த அடமான ரசீது தொலைந்து விட்டாலோ அல்லது காணாமல் போனாலோ, நகையை அடமானம் வைத்தவர் உரிய மதிப்பிற்குரிய பத்திரத் தாளில் ஒப்பந்தம் எழுதிக் கொடுத்து நகையை மீட்டுக் கொள்ளலாம்.</span></li>
                <li><span>17.</span><span>வாடிக்கையாளர்கள் தாங்கள் அடகு வைக்கும் நகைகளை வங்கி வேலை நாட்களில் மீட்டுக் கொள்ள வேண்டும்.</span></li>
            </ul>
            <div style={{ marginTop: '40px', textAlign: 'right' }} className="bold">கடன் பெறுபவர் கையொப்பம்</div>
        </div>

        <div className="terms-section page-break" style={{ marginTop: '0' }}>
            <h3 className="bold uppercase">Terms and Conditions</h3>
            <ul className="terms-list">
                <li><span>1.</span><span>If the loan is closed before 7 days, interest for a minimum period of 15 days will be charged.</span></li>
                <li><span>2.</span><span>The borrower shall pay the interest rate mentioned in the promissory note and any other charges fixed by the management from time to time.</span></li>
                <li><span>3.</span><span>In case of default, the management has the right to retain the articles pledged as security either for this loan or for any other amounts payable to the management by the borrower.</span></li>
                <li><span>4.</span><span>The management has the right, at any time, to transfer or assign the agreement and other documents executed by the borrower in favor of the management to any other bank or financial institution and receive payment.</span></li>
                <li><span>5.</span><span>The management officials or audit officers have full authority to inspect and verify the quality of the pledged jewellery.</span></li>
                <li><span>6.</span><span>Loan transactions such as availing the loan, paying interest, and repayment shall be carried out only during office working hours. If any due date falls on a holiday, the previous working day shall be treated as the due date.</span></li>
                <li><span>7.</span><span>The loan amount and interest can be repaid either by the borrower or by a person duly authorized by the borrower. Upon repayment of the principal and interest and surrender of the pledge receipt by the borrower or the authorized person, the pledged jewellery may be redeemed. If the borrower has not nominated any legal heirs, the pledged jewellery shall be handed over only after receiving the legally entitled amount as per law.</span></li>
                <li><span>8.</span><span>The borrower confirms that the loan shall not be used for any illegal or unlawful activities.</span></li>
                <li><span>9.</span><span>In case of part payment of the loan amount, the interest shall be adjusted first and only the remaining amount shall be credited towards the principal.</span></li>
                <li><span>10.</span><span>Any change of address must be informed to the management in writing and approval must be obtained. Failing which, the address mentioned in the application form shall be treated as the official address for all communications and purposes.</span></li>
                <li><span>11.</span><span>The pledged jewellery is the exclusive property of the borrower. No third party shall have any right or claim over it. The borrower shall indemnify the management against any costs or consequences arising therefrom.</span></li>
                <li><span>12.</span><span>If the borrower fails to repay the entire loan amount within the loan period mentioned in the promissory note or by the date specified by the management, the management shall, after giving a two-week prior notice, sell the pledged jewellery. If there is any shortfall after the sale, the same shall be recovered from the borrower. If there is any surplus, the management shall appropriate amounts due towards the gold loan. Any remaining surplus amount shall be paid to the borrower within 30 days.</span></li>
                <li><span>13.</span><span>The borrower shall bear all expenses related to acceptance of gold jewellery, collection of interest, sale of pledged articles, conversion into cash, statutory taxes payable to the government, administrative expenses, interest tax, service tax, stamp duty, sales tax, value added tax, and any other applicable charges, or shall pay the same to the management.</span></li>
                <li><span>14.</span><span>In the event of damage to the pledged jewellery due to unforeseen circumstances, the management shall either return equivalent jewellery matching the weight mentioned in the pledge receipt or pay an amount equivalent to the prevailing market value for that weight. Before receiving such compensation, the borrower must clear all outstanding principal, interest, and other charges payable to the management.</span></li>
                <li><span>15.</span><span>The loan is granted based on the quality of gold declared by the borrower. If at a later date it is found that the jewellery is of inferior quality or counterfeit, criminal proceedings shall be initiated against the borrower and the loan amount shall be recovered. All expenses arising therefrom shall be borne by the borrower.</span></li>
                <li><span>16.</span><span>If the pledge receipt issued by the management is lost or misplaced, the borrower may redeem the jewellery by executing an indemnity bond on a stamp paper of appropriate value.</span></li>
                <li><span>17.</span><span>Customers must redeem the pledged jewellery only on bank working days.</span></li>
            </ul>
            <div style={{ marginTop: '20px', textAlign: 'right' }} className="bold">BORROWER’S SIGNATURE</div>
        </div>
    </div>
);

const CustomerProfile = ({ customer }) => (
    <div>
        <h2 className="document-title">CUSTOMER PROFILE</h2>
        <div className="grid-2">
            <div>
                <div className="detail-group mb-4">
                    <label>Customer ID</label>
                    <div className="font-bold">{customer.customerId}</div>
                </div>
                <div className="detail-group mb-4">
                    <label>Join Date</label>
                    <div>{new Date(customer.createdAt).toLocaleDateString('en-IN')}</div>
                </div>
            </div>
            <div className="photo-column">
                {customer.photo && (
                    <img src={getImageUrl(customer.photo)} alt="Customer" className="customer-photo" />
                )}
            </div>
        </div>

        <div className="mb-8">
            <h3 className="text-sm font-bold border-b border-black mb-4 uppercase">Personal Information</h3>
            <div className="grid-2 gap-y-6">
                <div className="detail-group">
                    <label>Full Name</label>
                    <div>{customer.name}</div>
                </div>
                <div className="detail-group">
                    <label>Phone Number</label>
                    <div>{customer.phone}</div>
                </div>
                <div className="detail-group">
                    <label>Email Address</label>
                    <div>{customer.email || 'N/A'}</div>
                </div>
                <div className="detail-group">
                    <label>City/Location</label>
                    <div>{customer.city || 'N/A'}</div>
                </div>
            </div>
            <div className="detail-group mt-4">
                <label>Full Address</label>
                <div>{customer.address}</div>
            </div>
            <div className="detail-group mt-4">
                <label>Branch ID</label>
                <div>{customer.branch || 'N/A'}</div>
            </div>

        </div>

        <div className="footer">
            <div style={{ width: '100%', textAlign: 'center', fontSize: '10px', color: '#666' }}>
                Report Generated on {new Date().toLocaleString('en-IN')}
            </div>
        </div>
    </div>
);

const PaymentReceipt = ({ payment }) => (
    <div>
        <h2 className="document-title">PAYMENT RECEIPT</h2>
        <div className="grid-2">
            <div className="detail-group mb-4">
                <label>Receipt No</label>
                <div>{payment._id.substring(payment._id.length - 8).toUpperCase()}</div>
            </div>
            <div className="detail-group mb-4">
                <label>Date</label>
                <div>{new Date(payment.paymentDate).toLocaleDateString('en-IN')}</div>
            </div>
        </div>

        <div className="mb-6">
            <h3 className="text-sm font-bold border-b border-black mb-4 uppercase">Payment Details</h3>
            <div className="grid-2 gap-y-6">
                <div className="detail-group">
                    <label>Amount Paid</label>
                    <div className="text-2xl font-bold">₹{payment.amount}</div>
                </div>
                <div className="detail-group">
                    <label>Payment Type</label>
                    <div style={{ textTransform: 'capitalize' }}>{payment.type.replace('_', ' ')}</div>
                </div>
                <div className="detail-group">
                    <label>Payment Mode</label>
                    <div style={{ textTransform: 'capitalize' }}>{payment.paymentMode || 'Cash'}</div>
                </div>
                <div className="detail-group">
                    <label>Loan ID</label>
                    <div>{payment.loan?.loanId || 'N/A'}</div>
                </div>
                <div className="detail-group">
                    <label>Remarks</label>
                    <div>{payment.remarks || '-'}</div>
                </div>
            </div>
        </div>

        {payment.loan && (
            <div className="mb-6 p-4 bg-gray-50 border border-gray-200">
                <h3 className="text-sm font-bold border-b border-gray-400 mb-2 uppercase">Upcoming Payment</h3>
                <div className="grid-2">
                    <div className="detail-group">
                        <label>Next Due Date</label>
                        <div className="font-bold text-lg">

                            {new Date(payment.loan.nextPaymentDate).toLocaleDateString('en-IN')}
                        </div>
                    </div>
                    <div className="detail-group text-right">
                        <label>Next Interest Amount</label>
                        <div className="font-bold">
                            ₹{payment.loan.monthlyInterest ? payment.loan.monthlyInterest.toFixed(2) : ((payment.loan.loanAmount * (payment.loan.interestRate || 2)) / 100).toFixed(2)}
                        </div>
                    </div>
                </div>
                <div className="text-xs text-gray-500 mt-2 text-center">
                    Please pay by the due date to avoid penalty charges.
                </div>
            </div>
        )}
    </div>
);



const DemandReport = ({ report }) => (
    <div>
        <h2 className="document-title">DEMAND / OVERDUE REPORT</h2>
        <div className="mb-4 text-sm text-gray-500">
            Generated on: {new Date().toLocaleString()}
        </div>

        <table className="w-full text-xs text-left border-collapse">
            <thead>
                <tr className="border-b-2 border-black">
                    <th className="py-2">Loan ID</th>
                    <th className="py-2">Customer</th>
                    <th className="py-2">Date</th>
                    <th className="py-2">Amount</th>
                    <th className="py-2">Due Date</th>
                    <th className="py-2 text-right">Balance</th>
                </tr>
            </thead>
            <tbody>
                {report.map((loan, idx) => (
                    <tr key={loan._id} className="border-b border-gray-200">
                        <td className="py-2">{loan.loanId}</td>
                        <td className="py-2">{loan.customer?.name} <br /><span className="text-gray-400">{loan.customer?.phone}</span></td>
                        <td className="py-2">{new Date(loan.createdAt).toLocaleDateString('en-IN')}</td>
                        <td className="py-2">₹{loan.loanAmount}</td>
                        <td className="py-2 text-red-600 font-bold">{new Date(loan.dueDate || Date.now()).toLocaleDateString('en-IN')}</td>
                        <td className="py-2 text-right font-bold">₹{loan.currentBalance}</td>
                    </tr>
                ))}
            </tbody>
        </table>

        <div className="mt-8 pt-4 border-t border-black grid grid-cols-2">
            <div>
                <strong>Total Loans:</strong> {report.length}
            </div>
            <div className="text-right">
                <strong>Total Outstanding:</strong> ₹{report.reduce((sum, l) => sum + l.currentBalance, 0).toFixed(2)}
            </div>
        </div>
    </div>
);

const DayBookReport = ({ data, date }) => (
    <div>
        <h2 className="document-title">DAY BOOK REPORT</h2>
        <div className="mb-4 text-sm text-gray-500">
            Date: {new Date(date).toLocaleDateString('en-IN')}
        </div>

        <div className="summary-section mb-6">
            <table className="w-full text-xs text-left border-collapse">
                <thead>
                    <tr className="border-b-2 border-black bg-gray-50">
                        <th className="py-2 px-3 uppercase">Summary Item</th>
                        <th className="py-2 px-3 text-right uppercase">Amount</th>
                    </tr>
                </thead>
                <tbody>
                    <tr className="border-b border-gray-200">
                        <td className="py-2 px-3 font-semibold text-gray-600">Total Money In</td>
                        <td className="py-2 px-3 text-right font-bold text-green-600">₹{data.summary?.totalIn?.toLocaleString() || 0}</td>
                    </tr>
                    <tr className="border-b border-gray-200">
                        <td className="py-2 px-3 font-semibold text-gray-600">Total Money Out</td>
                        <td className="py-2 px-3 text-right font-bold text-red-600">₹{data.summary?.totalOut?.toLocaleString() || 0}</td>
                    </tr>
                    <tr className="border-b-2 border-black bg-gray-50">
                        <td className="py-2 px-3 font-bold text-gray-800">Net Change</td>
                        <td className="py-2 px-3 text-right font-bold text-blue-700">₹{data.summary?.netChange?.toLocaleString() || 0}</td>
                    </tr>
                </tbody>
            </table>
        </div>

        <table className="w-full text-xs text-left border-collapse">
            <thead>
                <tr className="border-b-2 border-black">
                    <th className="py-2">Time</th>
                    <th className="py-2">Type</th>
                    <th className="py-2">Category</th>
                    <th className="py-2">Description</th>
                    <th className="py-2 text-right">Amount</th>
                </tr>
            </thead>
            <tbody>
                {data.transactions?.map((t, idx) => (
                    <tr key={idx} className="border-b border-gray-200">
                        <td className="py-2">{new Date(t.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                        <td className="py-2">
                            <span className={`px-2 py-1 rounded-full text-[10px] uppercase font-bold ${t.type === 'CREDIT' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                {t.type}
                            </span>
                        </td>
                        <td className="py-2">{t.category}</td>
                        <td className="py-2">{t.description}</td>
                        <td className={`py-2 text-right font-bold ${t.type === 'CREDIT' ? 'text-green-600' : 'text-red-600'}`}>
                            {t.type === 'CREDIT' ? '+' : '-'}₹{t.amount.toLocaleString('en-IN')}
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);

const MiniStatement = ({ data }) => {
    const { loan, payments } = data;
    const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);

    return (
        <div>
            <h2 className="document-title">LOAN MINI STATEMENT</h2>
            <div className="mb-4 text-xs text-gray-500 text-center">
                Generated on: {new Date().toLocaleString()}
            </div>

            <div className="grid-2 mb-6">
                <div>
                    <div className="detail-group mb-2">
                        <label>Loan ID</label>
                        <div className="font-bold">{loan.loanId}</div>
                    </div>
                    <div className="detail-group mb-2">
                        <label>Customer</label>
                        <div>{loan.customer?.name}</div>
                        <div className="text-xs text-gray-500">{loan.customer?.phone}</div>
                    </div>
                </div>
                <div className="photo-column">
                    {loan.customer?.photo && (
                        <img src={getImageUrl(loan.customer.photo)} alt="Customer" className="customer-photo" />
                    )}
                    <div className="detail-group mb-2">
                        <label>Loan Amount</label>
                        <div className="font-bold">₹{loan.loanAmount}</div>
                    </div>
                    <div className="detail-group mb-2">
                        <label>Date</label>
                        <div>{new Date(loan.createdAt).toLocaleDateString('en-IN')}</div>
                    </div>
                </div>
            </div>

            <div className="mb-6 p-2 bg-gray-50 border border-dashed border-gray-300 rounded">
                <div className="grid grid-cols-5 gap-2 text-xs">
                    <div>
                        <span className="text-gray-500 block">Scheme</span>
                        <span className="font-bold">{loan.scheme?.schemeName}</span>
                    </div>
                    <div>
                        <span className="text-gray-500 block">Interest Rate</span>
                        <span className="font-bold">{loan.interestRate}%</span>
                    </div>
                    <div>
                        <span className="text-gray-500 block">Weight</span>
                        <span className="font-bold">{loan.totalWeight}g</span>
                    </div>
                    <div>
                        <span className="text-gray-500 block">Pre-Interest</span>
                        <span className="font-bold">₹{loan.preInterestAmount || 0}</span>
                    </div>
                    <div className="text-right">
                        <span className="text-gray-500 block">Current Balance</span>
                        <span className="font-bold text-red-600">₹{loan.currentBalance}</span>
                    </div>
                </div>
            </div>

            <h3 className="text-sm font-bold border-b border-black mb-3 uppercase">Transaction History</h3>
            <table className="w-full text-xs text-left border-collapse mb-6">
                <thead>
                    <tr className="border-b border-gray-400">
                        <th className="py-2">Date</th>
                        <th className="py-2">Type</th>
                        <th className="py-2">Mode</th>
                        <th className="py-2 text-right">Amount</th>
                    </tr>
                </thead>
                <tbody>
                    {/* Initial Loan */}
                    <tr className="border-b border-gray-100 bg-gray-50">
                        <td className="py-2">{new Date(loan.createdAt).toLocaleDateString('en-IN')}</td>
                        <td className="py-2">LOAN DISBURSED</td>
                        <td className="py-2">CASH</td>
                        <td className="py-2 text-right font-bold">₹{loan.loanAmount}</td>
                    </tr>
                    {loan.preInterestAmount > 0 && (
                        <tr className="border-b border-gray-100 bg-blue-50">
                            <td className="py-2">{new Date(loan.createdAt).toLocaleDateString('en-IN')}</td>
                            <td className="py-2">PRE-INTEREST COLLECTED</td>
                            <td className="py-2">CASH</td>
                            <td className="py-2 text-right font-bold text-green-600">-₹{loan.preInterestAmount}</td>
                        </tr>
                    )}
                    {payments.map(p => (
                        <tr key={p._id} className="border-b border-gray-100">
                            <td className="py-2">{new Date(p.paymentDate).toLocaleDateString('en-IN')}</td>
                            <td className="py-2 capitalize">{p.type.replace('_', ' ')}</td>
                            <td className="py-2 capitalize">{p.paymentMode || 'Cash'}</td>
                            <td className="py-2 text-right font-bold text-green-600">-₹{p.amount}</td>
                        </tr>
                    ))}
                    {payments.length === 0 && (
                        <tr>
                            <td colSpan="4" className="py-4 text-center text-gray-500 italic">No payments made yet.</td>
                        </tr>
                    )}
                </tbody>
            </table>

            <div className="flex justify-end border-t border-black pt-4">
                <div className="w-1/2">
                    <div className="flex justify-between mb-2 text-sm">
                        <span>Total Principal Received:</span>
                        <span className="font-bold">₹{payments.filter(p => p.type !== 'interest').reduce((s, p) => s + p.amount, 0)}</span>
                    </div>
                    <div className="flex justify-between mb-2 text-sm">
                        <span>Total Interest Received:</span>
                        <span className="font-bold">₹{payments.filter(p => p.type === 'interest').reduce((s, p) => s + p.amount, 0)}</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold border-t border-dashed border-gray-400 pt-2 mt-2">
                        <span>Outstanding Balance:</span>
                        <span>₹{loan.currentBalance}</span>
                    </div>
                </div>
            </div>

            <div className="footer">
                <div style={{ width: '100%', textAlign: 'center', fontSize: '10px', color: '#666' }}>
                    This is a computer generated statement.
                </div>
            </div>
        </div>
    );
};

export default PrintView;
