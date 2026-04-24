import React from 'react';
import { 
  Document, 
  Page, 
  Text, 
  View, 
  StyleSheet, 
  Font, 
  pdf 
} from '@react-pdf/renderer';

// Registering Inter explicitly with raw gstatic URLs for reliability in iframe environments.
Font.register({
  family: 'Inter',
  fonts: [
    { src: 'https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfMZhrib2Bg-4.ttf' },
    { src: 'https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuI6fMZhrib2Bg-4.ttf', fontWeight: 'bold' }
  ]
});

import { toast } from 'react-hot-toast';

const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: 'Inter', fontSize: 9.5, color: '#000', lineHeight: 1.4 },
  header: { marginBottom: 12, alignItems: 'center' },
  name: { fontSize: 24, fontWeight: 'bold', color: '#000', marginBottom: 5, textTransform: 'uppercase', letterSpacing: 1.5 },
  professionalTitles: { fontSize: 10, fontWeight: 'bold', color: '#000', textAlign: 'center', marginBottom: 6, width: '100%' },
  contactLine: { fontSize: 9, color: '#000', textAlign: 'center' },
  headerDivider: { borderBottomWidth: 1.5, borderBottomColor: '#000', marginBottom: 15, width: '100%' },
  sectionTitle: { fontSize: 12, fontWeight: 'bold', color: '#000', borderBottomWidth: 1.2, borderBottomColor: '#000', paddingBottom: 2, marginTop: 18, marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5 },
  summaryText: { marginBottom: 12, textAlign: 'justify', fontSize: 9.5 },
  jobHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 2 },
  jobTitle: { fontSize: 11, fontWeight: 'bold', color: '#000' },
  company: { fontSize: 10, fontWeight: 'bold', color: '#000', marginBottom: 4 },
  date: { fontSize: 10, color: '#000', textAlign: 'right' },
  bullet: { flexDirection: 'row', marginBottom: 3, paddingLeft: 8 },
  bulletDot: { width: 12, fontSize: 10 },
  bulletText: { flex: 1, fontSize: 9.5 },
  skillRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4, borderBottomWidth: 0.5, borderBottomColor: '#ccc', paddingBottom: 2 },
  skillName: { fontWeight: 'bold', flex: 1 },
  skillLevel: { color: '#444', width: 90, textAlign: 'right' },
});

const ResumePDF = ({ data }: { data: any }) => {
  if (!data || !data.contactInfo) {
    return (
      <Document>
        <Page size="A4">
          <Text>Invalid Resume Data</Text>
        </Page>
      </Document>
    );
  }

  const { contactInfo, professionalSummary, coreCompetencies, keyAchievements, workExperience, education, skills, certifications, additionalInfo } = data;

  return (
    <Document title={`Resume - ${contactInfo.name || 'Professional'}`}>
      <Page size="A4" style={styles.page}>
        {/* Header Section */}
        <View style={styles.header}>
          <View style={{ marginBottom: 8 }}>
            <Text style={styles.name}>{contactInfo.name || 'Name'}</Text>
          </View>
          {contactInfo.professionalTitles && contactInfo.professionalTitles.length > 0 ? (
            <View style={{ marginBottom: 6 }}>
              <Text style={styles.professionalTitles}>
                {contactInfo.professionalTitles.join(' | ')}
              </Text>
            </View>
          ) : null}
          <View style={{ marginTop: 2 }}>
            <Text style={styles.contactLine}>
              {[
                contactInfo.location,
                contactInfo.email,
                contactInfo.phone,
                contactInfo.linkedin ? `linkedin.com/in/${contactInfo.linkedin.replace(/.*\/in\//, '')}` : null
              ].filter(Boolean).join(' | ')}
            </Text>
          </View>
        </View>
        <View style={styles.headerDivider} />

        {/* Summary */}
        {professionalSummary && (
          <View>
            <Text style={styles.summaryText}>{professionalSummary}</Text>
          </View>
        )}

        {/* Core Competencies */}
        {coreCompetencies?.length > 0 && (
          <View>
            <Text style={styles.sectionTitle}>Core Competencies</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
              {coreCompetencies.map((comp: string, i: number) => (
                <View key={`pdf-comp-${i}`} style={[styles.bullet, { width: '50%' }]}>
                  <Text style={styles.bulletDot}>•</Text>
                  <Text style={styles.bulletText}>{comp}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Key Achievements */}
        {keyAchievements?.length > 0 && (
          <View>
            <Text style={styles.sectionTitle}>Key Achievements</Text>
            {keyAchievements.map((ach: string, i: number) => (
              <View key={`pdf-ach-${i}`} style={styles.bullet}>
                <Text style={styles.bulletDot}>•</Text>
                <Text style={styles.bulletText}>{ach}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Professional Experience */}
        {workExperience?.length > 0 && (
          <View>
            <Text style={styles.sectionTitle}>Professional Experience</Text>
            {workExperience.map((exp: any, i: number) => (
              <View key={`pdf-exp-${i}`} style={{ marginBottom: 15 }}>
                <View style={styles.jobHeader}>
                  <Text style={styles.jobTitle}>{exp.jobTitle}</Text>
                  <Text style={styles.date}>{exp.startDate} - {exp.endDate}</Text>
                </View>
                <Text style={styles.company}>{exp.company}{exp.location ? `, ${exp.location}` : ''}</Text>
                {exp.bullets?.map((b: string, j: number) => (
                  <View key={`pdf-bullet-${i}-${j}`} style={styles.bullet}>
                    <Text style={styles.bulletDot}>•</Text>
                    <Text style={styles.bulletText}>{b}</Text>
                  </View>
                ))}
              </View>
            ))}
          </View>
        )}

        {/* Education */}
        {education?.length > 0 && (
          <View>
            <Text style={styles.sectionTitle}>Education</Text>
            {education.map((edu: any, i: number) => (
              <View key={`pdf-edu-${i}`} style={{ marginBottom: 8 }}>
                <View style={styles.jobHeader}>
                  <Text style={styles.jobTitle}>{edu.degree}</Text>
                  <Text style={styles.date}>{edu.graduationYear}</Text>
                </View>
                <Text style={styles.company}>{edu.institution}{edu.location ? `, ${edu.location}` : ''}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Skills */}
        {skills?.length > 0 && (
          <View>
            <Text style={styles.sectionTitle}>Skills</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
              {skills.map((skill: any, i: number) => (
                <View key={`pdf-skill-${i}`} style={{ width: '48%' }}>
                   <View style={styles.skillRow}>
                    <Text style={styles.skillName}>{skill.name}</Text>
                    <Text style={styles.skillLevel}>{skill.level}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Certifications */}
        {certifications?.length > 0 && (
          <View>
            <Text style={styles.sectionTitle}>Certifications & Professional Development</Text>
            {certifications.map((cert: string, i: number) => (
              <View key={`pdf-cert-${i}`} style={styles.bullet}>
                <Text style={styles.bulletDot}>•</Text>
                <Text style={styles.bulletText}>{cert}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Additional Info */}
        {(additionalInfo?.languages?.length > 0 || additionalInfo?.awards?.length > 0) && (
          <View>
            <Text style={styles.sectionTitle}>Additional Information</Text>
            {additionalInfo.languages?.length > 0 && (
              <View style={styles.bullet}>
                <Text style={styles.bulletDot}>•</Text>
                <Text style={styles.bulletText}>Languages: {additionalInfo.languages.join(', ')}</Text>
              </View>
            )}
            {additionalInfo.awards?.length > 0 && (
              <View style={styles.bullet}>
                <Text style={styles.bulletDot}>•</Text>
                <Text style={styles.bulletText}>Awards: {additionalInfo.awards.join(', ')}</Text>
              </View>
            )}
          </View>
        )}
      </Page>
    </Document>
  );
};

export const downloadResumePDF = async (resumeData: any, filename: string) => {
  const loadingToast = toast.loading('Generating PDF...');
  try {
    const blob = await pdf(<ResumePDF data={resumeData} />).toBlob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename?.endsWith('.pdf') ? filename : `${filename || 'resume'}.pdf`;
    
    // Append to body and click for better browser compatibility
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
    toast.success('Resume downloaded!', { id: loadingToast });
  } catch (error) {
    console.error('PDF Generation Error:', error);
    toast.error('Failed to generate PDF. Please try again.', { id: loadingToast });
  }
};
