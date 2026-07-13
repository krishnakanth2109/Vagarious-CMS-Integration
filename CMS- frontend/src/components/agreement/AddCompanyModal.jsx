import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Building2, ArrowRight, ChevronDown, Download, FileText, Upload } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const InputGroup = ({ label, name, type = "text", placeholder, value, onChange, disabled, required = false, options = null, error = false }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <label style={{
            fontSize: '0.8rem',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            fontWeight: '700',
            color: '#64748b'
        }}>
            {label} {required && <span style={{ color: '#ef4444' }}>*</span>}
        </label>
        {options ? (
            <div style={{ position: 'relative' }}>
                <select
                    name={name}
                    value={value}
                    onChange={onChange}
                    style={{
                        width: '100%',
                        padding: '12px 16px',
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        borderRadius: '12px',
                        color: '#0f172a',
                        fontSize: '1rem',
                        outline: 'none',
                        cursor: 'pointer',
                        appearance: 'none',
                        transition: 'all 0.2s'
                    }}
                >
                    {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
                <div style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#64748b', display: 'flex' }}>
                    <ChevronDown size={18} />
                </div>
            </div>
        ) : (
            <input
                type={type}
                name={name}
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                disabled={disabled}
                required={required}
                autoComplete="off"
                style={{
                    width: '100%',
                    padding: '12px 16px',
                    background: disabled ? '#f1f5f9' : '#f8fafc',
                    border: error ? '2px solid #ef4444' : '1px solid #e2e8f0',
                    borderRadius: '12px',
                    color: disabled ? '#64748b' : '#0f172a',
                    fontSize: '1rem',
                    outline: 'none',
                    transition: 'all 0.2s',
                    cursor: disabled ? 'not-allowed' : 'text'
                }}
                onFocus={(e) => { if (!disabled && !error) { e.target.style.borderColor = '#283086'; e.target.style.boxShadow = '0 0 0 3px rgba(40, 48, 134, 0.1)' } }}
                onBlur={(e) => { if (!error) e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none' }}
            />
        )}
    </div>
);

const AddCompanyModal = ({ onClose, onSave, initialData, isViewOnly, apiUrl }) => {
    const parseDuration = (val) => {
        if (!val) return { days: '', hours: '', minutes: '' };
        const parts = String(val).split(':');
        if (parts.length === 3) {
            return {
                days: parts[0] || '0',
                hours: parts[1] || '0',
                minutes: parts[2] || '0'
            };
        }
        return {
            days: val || '0',
            hours: '0',
            minutes: '0'
        };
    };

    const [formData, setFormData] = useState(() => {
        if (initialData) {
            const existingSig = initialData.signature || '';
            const sigParts = existingSig.includes(' - ') ? existingSig.split(' - ') : [existingSig, ''];
            const pct = initialData.compensation?.percentage ?? initialData.percentage ?? 0;
            let jd = initialData.joining_date || '';
            if (jd && jd.includes('T')) jd = jd.split('T')[0];

            return {
                emp_id: initialData.emp_id || '',
                name: initialData.name || '',
                email: initialData.email || '',
                percentage: pct,
                joining_date: jd,
                address: initialData.address || '',
                replacement: initialData.replacement || '',
                invoice_post_joining: initialData.invoice_post_joining || '',
                payment_release: initialData.payment_release || '',
                sig_name: sigParts[0]?.trim() || '',
                sig_designation: sigParts[1]?.trim() || '',
                templateUrl: initialData.templateUrl || '',
                templateName: initialData.templateName || '',
            };
        }
        return {
            emp_id: '',
            name: '',
            email: '',
            percentage: '',
            joining_date: '',
            address: '',
            replacement: '',
            sig_name: '',
            sig_designation: '',
            invoice_post_joining: '',
            payment_release: '',
            templateUrl: '',
            templateName: ''
        };
    });

    const [duration, setDuration] = useState(() => parseDuration(formData.invoice_post_joining));
    const [uploading, setUploading] = useState(false);

    const handleDurationChange = (field, val) => {
        const num = val.replace(/[^0-9]/g, '');
        let newDuration = { ...duration, [field]: num };
        
        if (field === 'hours' && parseInt(num) > 23) newDuration.hours = '23';
        if (field === 'minutes' && parseInt(num) > 59) newDuration.minutes = '59';
        
        setDuration(newDuration);
        const dStr = `${newDuration.days || '0'}:${newDuration.hours || '0'}:${newDuration.minutes || '0'}`;
        setFormData(prev => ({ ...prev, invoice_post_joining: dStr }));
    };

    const handleTemplateUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.type !== 'application/pdf') {
            alert("Only PDF files are accepted!");
            return;
        }

        setUploading(true);
        const fData = new FormData();
        fData.append('file', file);
        fData.append('name', `${formData.name || 'Client'}_Template`);

        try {
            const baseUrl = apiUrl?.replace(/\/+$/, '') || 'http://localhost:5000';
            const res = await fetch(`${baseUrl}/upload/templates`, {
                method: 'POST',
                body: fData
            });

            if (res.ok) {
                const data = await res.json();
                if (data.status === 'success' && data.template) {
                    setFormData(prev => ({
                        ...prev,
                        templateUrl: data.template.url,
                        templateName: data.template.fileName || file.name
                    }));
                }
            } else {
                const err = await res.json();
                alert(`Upload failed: ${err.detail || 'Unknown error'}`);
            }
        } catch (err) {
            console.error("Upload error:", err);
            alert("An error occurred during file upload.");
        } finally {
            setUploading(false);
        }
    };

    const { authHeaders } = useAuth();
    const [clients, setClients] = useState([]);
    const [isLoadingClients, setIsLoadingClients] = useState(false);
    const [isManual, setIsManual] = useState(false);

    useEffect(() => {
        const fetchClients = async () => {
            setIsLoadingClients(true);
            try {
                const baseUrl = apiUrl?.replace(/\/+$/, '') || 'http://localhost:5000';
                const headers = {
                    "Content-Type": "application/json",
                    ...(await authHeaders()),
                };
                const response = await fetch(`${baseUrl}/api/clients`, { headers });
                if (response.ok) {
                    const data = await response.json();
                    setClients(data);
                }
            } catch (err) {
                console.error("Failed to fetch clients:", err);
            } finally {
                setIsLoadingClients(false);
            }
        };
        if (!isViewOnly && !initialData) {
            fetchClients();
        }
    }, [apiUrl, isViewOnly, initialData, authHeaders]);

    const handleClientSelect = (e) => {
        const clientName = e.target.value;
        if (!clientName || clientName === 'Select a Company') {
            setFormData({ ...formData, name: '' });
            return;
        }

        if (clientName === 'Manual Entry') {
            setIsManual(true);
            setFormData({ ...formData, name: '' });
            return;
        }

        const client = clients.find(c => c.companyName === clientName);
        if (client) {
            const lockingDays = client.lockingPeriod || '0';
            setFormData({
                ...formData,
                name: client.companyName || '',
                email: client.email || '',
                percentage: client.percentage || '',
                address: client.address || client.clientLocation || '',
                replacement: client.replacementPeriod || '',
                payment_release: client.paymentMode || '',
                invoice_post_joining: `${lockingDays}:0:0`
            });
            setDuration({
                days: lockingDays,
                hours: '0',
                minutes: '0'
            });
        }
    };

    const handleChange = (e) => {
        let { name, value } = e.target;

        if (name === 'email') {
            const lowerVal = value.toLowerCase();
            const dotComIndex = lowerVal.indexOf('.com');
            if (dotComIndex !== -1 && value.length > dotComIndex + 4) {
                value = value.substring(0, dotComIndex + 4);
            }
        }

        if (name === 'name') {
            value = value.replace(/[^a-zA-Z\s]/g, '');
            if (value.length > 0) {
                value = value.replace(/\b\w/g, c => c.toUpperCase());
            }
        }

        if (name === 'sig_name') {
            value = value.replace(/[^a-zA-Z\s]/g, '');
            if (value.length > 0) {
                value = value.replace(/\b\w/g, c => c.toUpperCase());
            }
        }

        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const sigName = formData.sig_name?.trim() || '';
        const sigDesig = formData.sig_designation?.trim() || '';
        const signature = sigDesig ? `${sigName} - ${sigDesig}` : sigName;

        const payload = {
            emp_id: formData.emp_id || '',
            name: formData.name || '',
            email: formData.email || '',
            percentage: formData.percentage ? parseFloat(formData.percentage) : 0,
            joining_date: formData.joining_date || null,
            address: formData.address || '',
            replacement: formData.replacement || '',
            invoice_post_joining: formData.invoice_post_joining || '',
            payment_release: formData.payment_release || '',
            signature,
            templateUrl: formData.templateUrl || '',
            templateName: formData.templateName || '',
        };
        onSave(payload);
    };

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(15, 23, 42, 0.6)',
            backdropFilter: 'blur(10px)',
            display: 'flex', justifyContent: 'center', alignItems: 'center',
            zIndex: 2000
        }}>
            <motion.div
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl rounded-3xl p-5 md:p-8 w-full ${isViewOnly && formData.templateUrl ? 'max-w-6xl' : 'max-w-3xl'} max-h-[90vh] overflow-y-auto mx-4`}
            >
                {/* Header */}
                <div style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
                    <h2 style={{
                        margin: 0,
                        fontSize: '1.8rem',
                        fontWeight: '800',
                        color: '#0f172a',
                        marginBottom: '0.5rem'
                    }}>
                        {isViewOnly ? 'View Company Details' : initialData ? 'Update Company Details' : 'Add New Company'}
                    </h2>
                    <p style={{ color: '#334155', margin: 0, fontSize: '0.9rem', fontWeight: '500' }}>
                        {isViewOnly ? 'Review details below.' : initialData ? 'Refine details for business agreement.' : 'Onboard a new company for agreement generation.'}
                    </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: (isViewOnly && formData.templateUrl) ? '1.1fr 0.9fr' : '1fr', gap: '2rem', alignItems: 'stretch' }}>
                    <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1.5rem' }}>
                        <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '20px', border: '1px solid #e2e8f0' }}>
                            <h3 style={{ margin: '0 0 1.5rem 0', color: '#0f172a', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <Building2 size={20} style={{ color: '#283086' }} />
                                <span style={{ borderBottom: '2px solid #283086', paddingBottom: '4px', fontWeight: 'bold' }}>Company Information</span>
                            </h3>
                            <div className="grid grid-cols-12 gap-4">
                                <div className="col-span-12 md:col-span-6">
                                    {!isViewOnly && !initialData && !isManual && clients.length > 0 ? (
                                        <InputGroup
                                            label="Company Name"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleClientSelect}
                                            required
                                            options={['Select a Company', 'Manual Entry', ...clients.map(c => c.companyName)]}
                                        />
                                    ) : (
                                        <div style={{ position: 'relative' }}>
                                            <InputGroup label="Company Name" name="name" placeholder="e.g. Arah Infotech" value={formData.name} onChange={handleChange} required disabled={isViewOnly} />
                                            {!isViewOnly && !initialData && !isViewOnly && clients.length > 0 && (
                                                <button
                                                    type="button"
                                                    onClick={() => { setIsManual(false); setFormData({ ...formData, name: '' }); }}
                                                    style={{ position: 'absolute', top: 0, right: 0, background: 'none', border: 'none', color: '#283086', fontSize: '0.7rem', fontWeight: 'bold', cursor: 'pointer', padding: '2px 8px' }}
                                                >
                                                    [ Use Dropdown ]
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                                <div className="col-span-12 md:col-span-6">
                                    <InputGroup label="Email Contact" name="email" type="email" placeholder="contact@arah.com" value={formData.email} onChange={handleChange} required disabled={isViewOnly} />
                                </div>
                                <div className="col-span-12 md:col-span-6">
                                    <InputGroup label="Date of Agreement" name="joining_date" type="date" value={formData.joining_date} onChange={handleChange} required disabled={isViewOnly} />
                                </div>
                                <div className="col-span-12 md:col-span-6">
                                    <InputGroup label="Compensation %" name="percentage" type="number" placeholder="8.33" value={formData.percentage} onChange={handleChange} required disabled={isViewOnly} />
                                </div>
                                <div className="col-span-12">
                                    <InputGroup label="Registered Office Address" name="address" placeholder="123 Tech Park, Hyderabad" value={formData.address} onChange={handleChange} required disabled={isViewOnly} />
                                </div>

                                <div className="col-span-12 md:col-span-4">
                                    <InputGroup label="Replacement (Days)" name="replacement" type="number" placeholder="e.g. 60" value={formData.replacement} onChange={handleChange} required disabled={isViewOnly} />
                                </div>
                                <div className="col-span-12 md:col-span-4">
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        <label style={{
                                            fontSize: '0.8rem',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.05em',
                                            fontWeight: '700',
                                            color: '#64748b'
                                        }}>
                                            Invoice Duration <span style={{ color: '#ef4444' }}>*</span>
                                        </label>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <div style={{ display: 'flex', flexDirection: 'column', flex: 1, alignItems: 'center' }}>
                                                <input
                                                    type="text"
                                                    placeholder="Days"
                                                    value={duration.days}
                                                    onChange={e => handleDurationChange('days', e.target.value)}
                                                    disabled={isViewOnly}
                                                    required
                                                    style={{
                                                        width: '100%',
                                                        padding: '12px 6px',
                                                        background: isViewOnly ? '#f1f5f9' : '#f8fafc',
                                                        border: '1px solid #e2e8f0',
                                                        borderRadius: '12px',
                                                        textAlign: 'center',
                                                        color: isViewOnly ? '#64748b' : '#0f172a',
                                                        fontSize: '0.9rem',
                                                        outline: 'none',
                                                        boxSizing: 'border-box'
                                                    }}
                                                />
                                                <span style={{ fontSize: '0.6rem', color: '#94a3b8', marginTop: '2px', fontWeight: 700 }}>DD</span>
                                            </div>
                                            <span style={{ fontWeight: 'bold', color: '#64748b', fontSize: '1.1rem', marginTop: '-12px' }}>:</span>
                                            <div style={{ display: 'flex', flexDirection: 'column', flex: 1, alignItems: 'center' }}>
                                                <input
                                                    type="text"
                                                    placeholder="Hrs"
                                                    value={duration.hours}
                                                    onChange={e => handleDurationChange('hours', e.target.value)}
                                                    disabled={isViewOnly}
                                                    required
                                                    style={{
                                                        width: '100%',
                                                        padding: '12px 6px',
                                                        background: isViewOnly ? '#f1f5f9' : '#f8fafc',
                                                        border: '1px solid #e2e8f0',
                                                        borderRadius: '12px',
                                                        textAlign: 'center',
                                                        color: isViewOnly ? '#64748b' : '#0f172a',
                                                        fontSize: '0.9rem',
                                                        outline: 'none',
                                                        boxSizing: 'border-box'
                                                    }}
                                                />
                                                <span style={{ fontSize: '0.6rem', color: '#94a3b8', marginTop: '2px', fontWeight: 700 }}>HH</span>
                                            </div>
                                            <span style={{ fontWeight: 'bold', color: '#64748b', fontSize: '1.1rem', marginTop: '-12px' }}>:</span>
                                            <div style={{ display: 'flex', flexDirection: 'column', flex: 1, alignItems: 'center' }}>
                                                <input
                                                    type="text"
                                                    placeholder="Min"
                                                    value={duration.minutes}
                                                    onChange={e => handleDurationChange('minutes', e.target.value)}
                                                    disabled={isViewOnly}
                                                    required
                                                    style={{
                                                        width: '100%',
                                                        padding: '12px 6px',
                                                        background: isViewOnly ? '#f1f5f9' : '#f8fafc',
                                                        border: '1px solid #e2e8f0',
                                                        borderRadius: '12px',
                                                        textAlign: 'center',
                                                        color: isViewOnly ? '#64748b' : '#0f172a',
                                                        fontSize: '0.9rem',
                                                        outline: 'none',
                                                        boxSizing: 'border-box'
                                                    }}
                                                />
                                                <span style={{ fontSize: '0.6rem', color: '#94a3b8', marginTop: '2px', fontWeight: 700 }}>MM</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-span-12 md:col-span-4">
                                    <InputGroup label="Payment (Days)" name="payment_release" type="number" placeholder="e.g. 15" value={formData.payment_release} onChange={handleChange} required disabled={isViewOnly} />
                                </div>

                                <div className="col-span-12 md:col-span-6">
                                    <InputGroup label="Signatory Name" name="sig_name" placeholder="e.g. Navya S" value={formData.sig_name} onChange={handleChange} required disabled={isViewOnly} />
                                </div>
                                <div className="col-span-12 md:col-span-6">
                                    <InputGroup label="Designation" name="sig_designation" placeholder="e.g. Managing Director" value={formData.sig_designation} onChange={handleChange} required disabled={isViewOnly} />
                                </div>
                            </div>
                        </div>

                        {/* PDF Template Manager Upload Section */}
                        <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '20px', border: '1px solid #e2e8f0' }}>
                            <h3 style={{ margin: '0 0 1.5rem 0', color: '#0f172a', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <FileText size={20} style={{ color: '#283086' }} />
                                <span style={{ borderBottom: '2px solid #283086', paddingBottom: '4px', fontWeight: 'bold' }}>Agreement Template (PDF)</span>
                            </h3>
                            
                            {formData.templateUrl ? (
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'white', padding: '12px 16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                                        <FileText size={18} style={{ color: '#16a34a', flexShrink: 0 }} />
                                        <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#334155', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                                            {formData.templateName || "client_template.pdf"}
                                        </span>
                                    </div>
                                    <div style={{ display: 'flex', gap: '8px', flexShrink: 0, marginLeft: '12px' }}>
                                        <button
                                            type="button"
                                            onClick={() => window.open(formData.templateUrl, '_blank')}
                                            style={{ padding: '6px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', background: 'white', fontSize: '0.8rem', fontWeight: 600, color: '#475569', cursor: 'pointer' }}
                                        >
                                            View
                                        </button>
                                        {!isViewOnly && (
                                            <button
                                                type="button"
                                                onClick={() => setFormData(prev => ({ ...prev, templateUrl: '', templateName: '' }))}
                                                style={{ padding: '6px 12px', border: 'none', borderRadius: '8px', background: '#ffe4e6', fontSize: '0.8rem', fontWeight: 600, color: '#ef4444', cursor: 'pointer' }}
                                            >
                                                Remove
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ) : isViewOnly ? (
                                <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0, fontStyle: 'italic' }}>No custom PDF template uploaded for this client.</p>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <input
                                        type="file"
                                        accept=".pdf"
                                        onChange={handleTemplateUpload}
                                        disabled={uploading}
                                        style={{ display: 'none' }}
                                        id="client-pdf-template"
                                    />
                                    <label
                                        htmlFor="client-pdf-template"
                                        style={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            padding: '1.5rem',
                                            border: '2px dashed #cbd5e1',
                                            borderRadius: '12px',
                                            cursor: uploading ? 'not-allowed' : 'pointer',
                                            background: 'white',
                                            textAlign: 'center',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        <Upload size={24} style={{ color: '#64748b', marginBottom: '8px' }} />
                                        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569' }}>
                                            {uploading ? "Uploading PDF Template..." : "Click to upload Client PDF Template"}
                                        </span>
                                        <span style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '4px' }}>Only PDF files are supported</span>
                                    </label>
                                </div>
                            )}
                        </div>

                        <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', paddingTop: '1.5rem', borderTop: '2px solid #e2e8f0' }}>
                            <button type="button" onClick={onClose} style={{
                                flex: 1,
                                padding: '14px',
                                background: isViewOnly ? '#283086' : 'transparent',
                                border: isViewOnly ? 'none' : '2px solid #e2e8f0',
                                color: isViewOnly ? 'white' : '#0f172a',
                                fontSize: '1rem',
                                fontWeight: 'bold',
                                borderRadius: '14px',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                boxShadow: isViewOnly ? '0 8px 20px -5px rgba(40, 48, 134, 0.4)' : 'none'
                            }}
                                onMouseOver={(e) => { if (!isViewOnly) e.currentTarget.style.background = '#f1f5f9'; }}
                                onMouseOut={(e) => { if (!isViewOnly) e.currentTarget.style.background = 'transparent'; }}
                            >
                                {isViewOnly ? 'Close' : 'Cancel'}
                            </button>
                            {!isViewOnly && (
                                <button type="submit" style={{
                                    flex: 2,
                                    padding: '14px',
                                    background: '#283086',
                                    border: 'none',
                                    color: 'white',
                                    fontSize: '1.05rem',
                                    fontWeight: '800',
                                    borderRadius: '14px',
                                    cursor: 'pointer',
                                    boxShadow: '0 8px 20px -5px rgba(40, 48, 134, 0.4)',
                                    transition: 'transform 0.1s, background 0.2s',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px'
                                }}
                                    onMouseOver={(e) => e.currentTarget.style.background = '#1e2570'}
                                    onMouseOut={(e) => e.currentTarget.style.background = '#283086'}
                                    onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.98)'}
                                    onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                >
                                    {initialData ? 'Apply Updates' : 'Add Company'}
                                    <ArrowRight size={20} />
                                </button>
                            )}
                        </div>
                    </form>

                    {/* PDF Preview on the Right (only in view mode with template) */}
                    {isViewOnly && formData.templateUrl && (
                        <div style={{ display: 'flex', flexDirection: 'column', border: '1px solid #e2e8f0', borderRadius: '24px', overflow: 'hidden', background: '#f1f5f9', minHeight: '450px' }}>
                            <div style={{ padding: '10px 16px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155' }}>PDF Template Preview</span>
                                <a href={formData.templateUrl} target="_blank" rel="noreferrer" style={{ fontSize: '0.75rem', fontWeight: 600, color: '#283086', textDecoration: 'none' }}>Open in New Tab</a>
                            </div>
                            <iframe
                                src={`${formData.templateUrl}#navpanes=0&view=FitH`}
                                title="Client Template Preview"
                                style={{ width: '100%', height: '100%', minHeight: '400px', border: 'none', flex: 1 }}
                            />
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

export default AddCompanyModal;
