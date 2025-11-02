"use client";

import React from "react";

export default function ModernReportPreview() {
    // Account data
    const accountData = {
        companyName: "XYZ Inspections",
        companyLogo: null,
        email: "mark.s.garcia.sf@gmail.com",
        phoneNumber: "555-123-4567",
        companyAddress: {
            street: "11639 E Chestnut Ct, Chandler, AZ 85249, USA"
        }
    };

    // Sample data matching the attached images
    const sampleData = {
        clientName: "Mark Demo",
        propertyAddress: "251 N Bristol Ave, Los Angeles, CA 90049",
        inspectionDate: "August 8, 2025",
        inspectorName: "Mark Garcia",
        license: "mark.s.garcia.sf@gmail.com",
        additionalInfo: null,
        sections: [
            {
                sectionNumber: 2,
                name: "INSPECTION REPORT OVERVIEW",
                lineItems: [
                    {
                        lineItemNumber: 1,
                        title: "UNDERSTANDING THERMAL IMAGING",
                        inspectionStatus: "I",
                        isDeficient: false,
                        comments: [
                            {
                                label: "Thermal Imaging Information",
                                commentText: "Please be advised that infrared thermal imaging may be utilized to assess specific areas or systems for potential anomalies. Any indications observed through thermal imaging are always corroborated by supplementary methods, such as a moisture meter, to confirm their presence. The effectiveness of infrared thermography in detecting moisture is contingent upon the actual presence of moisture; therefore, during dry periods, a leak may exist but remain undetectable if the affected materials are devoid of moisture. It is crucial to understand that thermal imaging does not function as X-ray vision, cannot penetrate solid surfaces, and is not capable of identifying mold.",
                                photos: [],
                                videos: []
                            }
                        ]
                    }
                ]
            },
            {
                sectionNumber: 5,
                name: "GROUND-LEVEL EXTERIOR STRUCTURES",
                lineItems: [
                    {
                        lineItemNumber: 2,
                        title: "SURFACE CONCEALMENT BY CARPETING",
                        inspectionStatus: "I",
                        isDeficient: false,
                        comments: [
                            {
                                label: "Maintenance",
                                commentText: "The surface of the entryway was covered with an outdoor carpet material, which prevented a comprehensive inspection of the underlying structure.",
                                photos: [],
                                videos: []
                            }
                        ]
                    },
                    {
                        lineItemNumber: 3,
                        title: "ABSENCE OF WEEP OPENINGS",
                        inspectionStatus: "I",
                        isDeficient: false,
                        comments: [
                            {
                                label: "General Information",
                                commentText: "The brick veneer lacked visible weep openings. Without these provisions, moisture may become trapped behind the brick, potentially leading to concealed damage. It is recommended to consult a qualified masonry professional to assess the need for weep openings and to perform any necessary installations.",
                                photos: [],
                                videos: []
                            }
                        ]
                    },
                    {
                        lineItemNumber: 3,
                        title: "RESTRICTED ACCESS TO BUILDING SIDES",
                        inspectionStatus: "NI",
                        isDeficient: false,
                        comments: [
                            {
                                label: "Recommendation",
                                commentText: "Full access to certain sides of the structure was obstructed, preventing a complete evaluation of these areas during the inspection. These sections are therefore excluded from the scope of this report.",
                                photos: [],
                                videos: []
                            }
                        ]
                    }
                ]
            }
        ]
    };

    // Helper functions
    const substring = (str: string, start: number, end?: number) => {
        if (!str) return "";
        return str.substring(start, end).toUpperCase();
    };

    return (
        <div style={{
            fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
            background: "#ffffff",
            color: "#333333",
            lineHeight: "1.5",
            fontSize: "14px"
        }}>
            <div style={{
                maxWidth: "8.5in",
                margin: "0 auto",
                background: "white",
                borderRadius: "8px",
                overflow: "hidden",
                boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)"
            }}>
                {/* Header Section */}
                <div style={{
                    background: "#ffffff",
                    padding: "40px",
                    borderBottom: "1px solid #e5e7eb",
                    position: "relative" as const
                }}>
                    {/* Company Information Bar */}
                    <div style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginBottom: "32px",
                        padding: "20px",
                        background: "#f9fafb",
                        borderRadius: "12px",
                        border: "1px solid #e5e7eb"
                    }}>
                        <div style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "16px"
                        }}>
                            <div style={{
                                width: "60px",
                                height: "60px",
                                background: "#3b82f6",
                                borderRadius: "8px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: "white",
                                fontWeight: "700",
                                fontSize: "18px",
                                flexShrink: 0
                            }}>
                                {accountData.companyLogo ? (
                                    <img src={accountData.companyLogo} alt={accountData.companyName} style={{
                                        width: "100%",
                                        height: "100%",
                                        objectFit: "contain",
                                        borderRadius: "8px"
                                    }} />
                                ) : (
                                    substring(accountData.companyName || "XYZ", 0, 3)
                                )}
                            </div>
                            <div>
                                <h1 style={{
                                    fontSize: "24px",
                                    fontWeight: "700",
                                    color: "#1f2937",
                                    marginBottom: "4px",
                                    margin: "0 0 4px 0"
                                }}>
                                    {accountData.companyName}
                                </h1>
                                {accountData.companyAddress?.street && (
                                    <div style={{
                                        fontSize: "14px",
                                        color: "#6b7280",
                                        marginBottom: "2px"
                                    }}>
                                        {accountData.companyAddress.street}
                                    </div>
                                )}
                            </div>
                        </div>
                        <div style={{
                            textAlign: "right" as const,
                            fontSize: "14px",
                            color: "#6b7280"
                        }}>
                            {accountData.phoneNumber}<br />
                            {accountData.email}
                        </div>
                    </div>

                    {/* Property Image Placeholder */}
                    <div style={{
                        width: "100%",
                        height: "280px",
                        background: "#f3f4f6",
                        borderRadius: "12px",
                        marginBottom: "32px",
                        border: "1px solid #e5e7eb",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundImage: "url('data:image/svg+xml,%3Csvg xmlns=\"http://www.w3.org/2000/svg\" width=\"600\" height=\"280\" viewBox=\"0 0 600 280\"%3E%3Crect width=\"600\" height=\"280\" fill=\"%23f3f4f6\"/%3E%3Ctext x=\"300\" y=\"140\" text-anchor=\"middle\" font-family=\"Arial\" font-size=\"16\" fill=\"%236b7280\"%3EProperty Photo%3C/text%3E%3C/svg%3E')",
                        backgroundSize: "cover",
                        backgroundPosition: "center"
                    }} />

                    {/* Report Title */}
                    <div style={{
                        textAlign: "center" as const,
                        marginBottom: "32px"
                    }}>
                        <h1 style={{
                            fontSize: "36px",
                            fontWeight: "700",
                            color: "#1f2937",
                            marginBottom: "8px",
                            margin: "0 0 8px 0"
                        }}>
                            Home Inspection Report
                        </h1>
                        <p style={{
                            fontSize: "18px",
                            color: "#6b7280",
                            fontWeight: "500",
                            margin: "0"
                        }}>
                            Comprehensive Property Assessment
                        </p>
                    </div>

                    {/* Property Information Card */}
                    <div style={{
                        background: "#f9fafb",
                        border: "1px solid #e5e7eb",
                        borderRadius: "12px",
                        padding: "24px",
                        marginBottom: "24px"
                    }}>
                        <div style={{
                            fontSize: "20px",
                            fontWeight: "600",
                            color: "#1f2937",
                            textAlign: "center" as const,
                            marginBottom: "8px"
                        }}>
                            {sampleData.propertyAddress}
                        </div>
                        <div style={{
                            fontSize: "16px",
                            color: "#6b7280",
                            textAlign: "center" as const,
                            marginBottom: "20px"
                        }}>
                            {sampleData.clientName}
                        </div>
                        <div style={{
                            fontSize: "14px",
                            color: "#6b7280",
                            textAlign: "center" as const,
                            marginBottom: "20px"
                        }}>
                            Inspection Date: {sampleData.inspectionDate}
                        </div>

                        {/* Inspector Information */}
                        <div style={{
                            display: "flex",
                            justifyContent: "space-between",
                            gap: "20px"
                        }}>
                            <div style={{
                                flex: 1,
                                background: "white",
                                border: "1px solid #e5e7eb",
                                borderRadius: "8px",
                                padding: "16px",
                                display: "flex",
                                alignItems: "center",
                                gap: "12px"
                            }}>
                                <div style={{
                                    width: "40px",
                                    height: "40px",
                                    borderRadius: "50%",
                                    background: "#3b82f6",
                                    color: "white",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontWeight: "600",
                                    fontSize: "14px",
                                    flexShrink: 0
                                }}>
                                    {substring(sampleData.inspectorName, 0, 2)}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{
                                        fontSize: "11px",
                                        textTransform: "uppercase" as const,
                                        color: "#6b7280",
                                        fontWeight: "600",
                                        marginBottom: "2px"
                                    }}>
                                        INSPECTOR
                                    </div>
                                    <div style={{
                                        fontSize: "14px",
                                        fontWeight: "600",
                                        color: "#1f2937"
                                    }}>
                                        {sampleData.inspectorName}
                                    </div>
                                    <div style={{
                                        fontSize: "12px",
                                        color: "#6b7280"
                                    }}>
                                        {sampleData.license}
                                    </div>
                                </div>
                            </div>
                            <div style={{
                                flex: 1,
                                background: "white",
                                border: "1px solid #e5e7eb",
                                borderRadius: "8px",
                                padding: "16px",
                                display: "flex",
                                alignItems: "center",
                                gap: "12px"
                            }}>
                                <div style={{
                                    width: "40px",
                                    height: "40px",
                                    borderRadius: "50%",
                                    background: "#3b82f6",
                                    color: "white",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontWeight: "600",
                                    fontSize: "14px",
                                    flexShrink: 0
                                }}>
                                    MA
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{
                                        fontSize: "11px",
                                        textTransform: "uppercase" as const,
                                        color: "#6b7280",
                                        fontWeight: "600",
                                        marginBottom: "2px"
                                    }}>
                                        PRIMARY AGENT
                                    </div>
                                    <div style={{
                                        fontSize: "14px",
                                        fontWeight: "600",
                                        color: "#1f2937"
                                    }}>
                                        Mark Agent
                                    </div>
                                    <div style={{
                                        fontSize: "12px",
                                        color: "#6b7280"
                                    }}>
                                        510381725<br />mark@agent.app
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Table of Contents */}
                <div style={{
                    background: "#ffffff",
                    padding: "40px",
                    borderBottom: "1px solid #e5e7eb"
                }}>
                    <div style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "32px",
                        paddingBottom: "16px",
                        borderBottom: "1px solid #e5e7eb"
                    }}>
                        <h2 style={{
                            fontSize: "28px",
                            fontWeight: "700",
                            color: "#1f2937",
                            margin: "0"
                        }}>
                            Table of Contents
                        </h2>
                        <div style={{
                            fontSize: "14px",
                            color: "#6b7280",
                            textAlign: "right" as const
                        }}>
                            {sampleData.propertyAddress}<br />
                            {sampleData.inspectionDate}
                        </div>
                    </div>
                    <ul style={{
                        listStyle: "none",
                        padding: 0,
                        margin: 0
                    }}>
                        {sampleData.sections.map((section, index) => (
                            <li key={index} style={{
                                display: "flex",
                                alignItems: "center",
                                padding: "12px 0",
                                borderBottom: "1px solid #f3f4f6",
                                fontSize: "16px",
                                color: "#374151"
                            }}>
                                <span style={{
                                    fontWeight: "600",
                                    color: "#1f2937",
                                    minWidth: "24px",
                                    marginRight: "16px"
                                }}>
                                    {section.sectionNumber}.
                                </span>
                                <span>{section.name}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Dynamic Sections */}
                {sampleData.sections.map((section, sectionIndex) => (
                    <div key={sectionIndex} style={{
                        padding: "40px",
                        borderBottom: "1px solid #e5e7eb"
                    }}>
                        <div style={{
                            display: "flex",
                            alignItems: "center",
                            marginBottom: "32px",
                            paddingBottom: "16px",
                            borderBottom: "2px solid #e5e7eb"
                        }}>
                            <div style={{
                                fontSize: "32px",
                                fontWeight: "700",
                                color: "#1f2937",
                                marginRight: "16px",
                                minWidth: "50px"
                            }}>
                                {section.sectionNumber}.
                            </div>
                            <div style={{
                                fontSize: "24px",
                                fontWeight: "700",
                                color: "#1f2937",
                                textTransform: "uppercase" as const,
                                letterSpacing: "0.5px"
                            }}>
                                {section.name}
                            </div>
                        </div>

                        {section.lineItems.map((lineItem, lineItemIndex) => (
                            <div key={lineItemIndex} style={{
                                background: "#ffffff",
                                border: "1px solid #e5e7eb",
                                borderRadius: "12px",
                                marginBottom: "24px",
                                overflow: "hidden",
                                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)"
                            }}>
                                <div style={{
                                    background: "#f9fafb",
                                    padding: "20px",
                                    borderBottom: "1px solid #e5e7eb",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between"
                                }}>
                                    <div style={{
                                        display: "flex",
                                        alignItems: "center",
                                        flex: 1
                                    }}>
                                        <div style={{
                                            fontSize: "18px",
                                            fontWeight: "700",
                                            color: "#3b82f6",
                                            marginRight: "12px",
                                            minWidth: "32px"
                                        }}>
                                            {section.sectionNumber}.{lineItem.lineItemNumber}
                                        </div>
                                        <div style={{
                                            fontSize: "18px",
                                            fontWeight: "600",
                                            color: "#1f2937",
                                            lineHeight: "1.4"
                                        }}>
                                            {lineItem.title}
                                        </div>
                                    </div>
                                    <div style={{
                                        display: "flex",
                                        gap: "8px",
                                        alignItems: "center",
                                        flexShrink: 0
                                    }}>
                                        {lineItem.inspectionStatus === 'I' && (
                                            <span style={{
                                                padding: "6px 12px",
                                                borderRadius: "6px",
                                                fontSize: "11px",
                                                fontWeight: "600",
                                                textTransform: "uppercase" as const,
                                                letterSpacing: "0.5px",
                                                background: "#d1fae5",
                                                color: "#047857",
                                                border: "1px solid #a7f3d0"
                                            }}>
                                                Inspected
                                            </span>
                                        )}
                                        {lineItem.inspectionStatus === 'NI' && (
                                            <span style={{
                                                padding: "6px 12px",
                                                borderRadius: "6px",
                                                fontSize: "11px",
                                                fontWeight: "600",
                                                textTransform: "uppercase" as const,
                                                letterSpacing: "0.5px",
                                                background: "#fef3c7",
                                                color: "#b45309",
                                                border: "1px solid #fde68a"
                                            }}>
                                                Not Inspected
                                            </span>
                                        )}
                                        {lineItem.inspectionStatus === 'NP' && (
                                            <span style={{
                                                padding: "6px 12px",
                                                borderRadius: "6px",
                                                fontSize: "11px",
                                                fontWeight: "600",
                                                textTransform: "uppercase" as const,
                                                letterSpacing: "0.5px",
                                                background: "#dbeafe",
                                                color: "#1d4ed8",
                                                border: "1px solid #bfdbfe"
                                            }}>
                                                Not Present
                                            </span>
                                        )}
                                        {lineItem.isDeficient && (
                                            <span style={{
                                                padding: "6px 12px",
                                                borderRadius: "6px",
                                                fontSize: "11px",
                                                fontWeight: "600",
                                                textTransform: "uppercase" as const,
                                                letterSpacing: "0.5px",
                                                background: "#fee2e2",
                                                color: "#dc2626",
                                                border: "1px solid #fecaca"
                                            }}>
                                                Deficient
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div style={{ padding: "24px" }}>
                                    {lineItem.comments.map((comment, commentIndex) => (
                                        <div key={commentIndex} style={{
                                            background: "#f9fafb",
                                            border: "1px solid #e5e7eb",
                                            borderRadius: "8px",
                                            padding: "20px",
                                            marginBottom: commentIndex < lineItem.comments.length - 1 ? "16px" : "0"
                                        }}>
                                            <div style={{
                                                fontSize: "12px",
                                                fontWeight: "700",
                                                color: "#6b7280",
                                                textTransform: "uppercase" as const,
                                                marginBottom: "12px",
                                                letterSpacing: "0.5px"
                                            }}>
                                                {comment.label}
                                            </div>
                                            <div style={{
                                                fontSize: "14px",
                                                color: "#1f2937",
                                                lineHeight: "1.6",
                                                whiteSpace: "pre-line" as const,
                                                wordWrap: "break-word" as const
                                            }}>
                                                {comment.commentText}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                ))}

                {/* Footer */}
                <div style={{
                    background: "#1f2937",
                    padding: "32px 40px",
                    color: "#d1d5db",
                    fontSize: "12px"
                }}>
                    <div style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        flexWrap: "wrap" as const,
                        gap: "16px"
                    }}>
                        <div style={{ fontWeight: "600" }}>
                            {accountData.companyName} • Home Inspection Report • {sampleData.inspectionDate}
                        </div>
                        <div style={{ color: "#9ca3af" }}>
                            XYZ Inspections - Powered By Binsr Inspect • Page 2 of 40
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}