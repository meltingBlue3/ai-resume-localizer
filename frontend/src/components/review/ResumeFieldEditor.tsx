import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type {
  CnResumeData,
  EducationEntry,
  WorkEntry,
  SkillEntry,
  CertificationEntry,
  ProjectEntry,
} from '../../types/resume';

interface ResumeFieldEditorProps {
  data: CnResumeData;
  onChange: (data: CnResumeData) => void;
  readOnly?: boolean;
}

function updateAt<T>(arr: T[], index: number, patch: Partial<T>): T[] {
  return arr.map((item, i) => (i === index ? { ...item, ...patch } : item));
}

function removeAt<T>(arr: T[], index: number): T[] {
  return arr.filter((_, i) => i !== index);
}

function CollapsibleSection({
  title,
  children,
  defaultOpen = true,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-lg border border-slate-200 bg-white">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-semibold text-slate-700 hover:bg-slate-50"
      >
        {title}
        <svg
          className={`h-4 w-4 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && <div className="border-t border-slate-100 px-4 py-3">{children}</div>}
    </div>
  );
}

function FieldInput({
  label,
  value,
  onChange,
  multiline = false,
  readOnly = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  multiline?: boolean;
  readOnly?: boolean;
}) {
  const cls =
    'w-full rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-800 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none';
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-slate-500">{label}</span>
      {readOnly ? (
        <p className={`text-sm text-gray-800 py-1 ${multiline ? 'whitespace-pre-wrap' : ''}`}>
          {value || '\u00A0'}
        </p>
      ) : multiline ? (
        <textarea rows={3} className={cls} value={value} onChange={(e) => onChange(e.target.value)} />
      ) : (
        <input type="text" className={cls} value={value} onChange={(e) => onChange(e.target.value)} />
      )}
    </label>
  );
}

function AddButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1 rounded-md border border-dashed border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-500 hover:border-blue-400 hover:text-blue-600"
    >
      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
      </svg>
      {label}
    </button>
  );
}

function RemoveButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-xs text-red-400 hover:text-red-600"
    >
      {label}
    </button>
  );
}

export default function ResumeFieldEditor({ data, onChange, readOnly = false }: ResumeFieldEditorProps) {
  const { t } = useTranslation('wizard');
  const f = (key: string) => t(`steps.reviewExtraction.fields.${key}`);
  const s = (key: string) => t(`steps.reviewExtraction.sections.${key}`);

  const set = (patch: Partial<CnResumeData>) => onChange({ ...data, ...patch });

  const personalFields: { key: keyof CnResumeData; label: string }[] = [
    { key: 'name', label: f('name') },
    { key: 'phone', label: f('phone') },
    { key: 'email', label: f('email') },
    { key: 'date_of_birth', label: f('dateOfBirth') },
    { key: 'address', label: f('address') },
    { key: 'nationality', label: f('nationality') },
    { key: 'gender', label: f('gender') },
    { key: 'age', label: f('age') },
    { key: 'emergency_contact_address', label: f('emergencyContactAddress') },
    { key: 'commute_time', label: f('commuteTime') },
    { key: 'marital_status', label: f('maritalStatus') },
    { key: 'dependents_count', label: f('dependentsCount') },
    { key: 'expected_salary', label: f('expectedSalary') },
  ];

  const education = data.education ?? [];
  const workExp = data.work_experience ?? [];
  const skills = data.skills ?? [];
  const certs = data.certifications ?? [];
  const langs = data.languages ?? [];
  const projects = data.project_experience ?? [];
  const portfolioLinks = data.portfolio_links ?? [];

  const emptyEdu: EducationEntry = { school: null, major: null, degree: null, start_date: null, end_date: null };
  const emptyWork: WorkEntry = { company: null, position: null, department: null, start_date: null, end_date: null, description: null };
  const emptySkill: SkillEntry = { name: null, level: null };
  const emptyCert: CertificationEntry = { name: null, date: null };
  const emptyProject: ProjectEntry = { project_name: null, associated_company: null, role: null, start_date: null, end_date: null, description: null };

  return (
    <div className="space-y-3">
      {/* Personal Info */}
      <CollapsibleSection title={s('personalInfo')}>
        <div className="grid grid-cols-2 gap-3">
          {personalFields.map(({ key, label }) => (
            <FieldInput
              key={key}
              label={label}
              value={(data[key] as string) ?? ''}
              onChange={(v) => set({ [key]: v || null })}
              readOnly={readOnly}
            />
          ))}
        </div>
      </CollapsibleSection>

      {/* Education */}
      <CollapsibleSection title={s('education')}>
        <div className="space-y-3">
          {education.map((entry, i) => (
            <div key={i} className="space-y-2 rounded-md border border-slate-100 bg-slate-50 p-3">
              {!readOnly && (
                <div className="flex justify-end">
                  <RemoveButton label={t('steps.reviewExtraction.removeEntry')} onClick={() => set({ education: removeAt(education, i) })} />
                </div>
              )}
              <div className="grid grid-cols-2 gap-2">
                <FieldInput label={f('school')} value={entry.school ?? ''} onChange={(v) => set({ education: updateAt(education, i, { school: v || null }) })} readOnly={readOnly} />
                <FieldInput label={f('major')} value={entry.major ?? ''} onChange={(v) => set({ education: updateAt(education, i, { major: v || null }) })} readOnly={readOnly} />
                <FieldInput label={f('degree')} value={entry.degree ?? ''} onChange={(v) => set({ education: updateAt(education, i, { degree: v || null }) })} readOnly={readOnly} />
                <FieldInput label={f('startDate')} value={entry.start_date ?? ''} onChange={(v) => set({ education: updateAt(education, i, { start_date: v || null }) })} readOnly={readOnly} />
                <FieldInput label={f('endDate')} value={entry.end_date ?? ''} onChange={(v) => set({ education: updateAt(education, i, { end_date: v || null }) })} readOnly={readOnly} />
              </div>
            </div>
          ))}
          {!readOnly && <AddButton label={t('steps.reviewExtraction.addEntry')} onClick={() => set({ education: [...education, emptyEdu] })} />}
        </div>
      </CollapsibleSection>

      {/* Work Experience */}
      <CollapsibleSection title={s('workExperience')}>
        <div className="space-y-3">
          {workExp.map((entry, i) => (
            <div key={i} className="space-y-2 rounded-md border border-slate-100 bg-slate-50 p-3">
              {!readOnly && (
                <div className="flex justify-end">
                  <RemoveButton label={t('steps.reviewExtraction.removeEntry')} onClick={() => set({ work_experience: removeAt(workExp, i) })} />
                </div>
              )}
              <div className="grid grid-cols-2 gap-2">
                <FieldInput label={f('company')} value={entry.company ?? ''} onChange={(v) => set({ work_experience: updateAt(workExp, i, { company: v || null }) })} readOnly={readOnly} />
                <FieldInput label={f('position')} value={entry.position ?? ''} onChange={(v) => set({ work_experience: updateAt(workExp, i, { position: v || null }) })} readOnly={readOnly} />
                <FieldInput label={f('department')} value={entry.department ?? ''} onChange={(v) => set({ work_experience: updateAt(workExp, i, { department: v || null }) })} readOnly={readOnly} />
                <FieldInput label={f('startDate')} value={entry.start_date ?? ''} onChange={(v) => set({ work_experience: updateAt(workExp, i, { start_date: v || null }) })} readOnly={readOnly} />
                <FieldInput label={f('endDate')} value={entry.end_date ?? ''} onChange={(v) => set({ work_experience: updateAt(workExp, i, { end_date: v || null }) })} readOnly={readOnly} />
              </div>
              <FieldInput label={f('description')} value={entry.description ?? ''} multiline onChange={(v) => set({ work_experience: updateAt(workExp, i, { description: v || null }) })} readOnly={readOnly} />
            </div>
          ))}
          {!readOnly && <AddButton label={t('steps.reviewExtraction.addEntry')} onClick={() => set({ work_experience: [...workExp, emptyWork] })} />}
        </div>
      </CollapsibleSection>

      {/* Project Experience */}
      <CollapsibleSection title={s('projectExperience')}>
        <div className="space-y-3">
          {projects.map((entry, i) => (
            <div key={i} className="space-y-2 rounded-md border border-slate-100 bg-slate-50 p-3">
              {!readOnly && (
                <div className="flex justify-end">
                  <RemoveButton label={t('steps.reviewExtraction.removeEntry')} onClick={() => set({ project_experience: removeAt(projects, i) })} />
                </div>
              )}
              <div className="grid grid-cols-2 gap-2">
                <FieldInput label={f('projectName')} value={entry.project_name ?? ''} onChange={(v) => set({ project_experience: updateAt(projects, i, { project_name: v || null }) })} readOnly={readOnly} />
                <FieldInput label={f('associatedCompany')} value={entry.associated_company ?? ''} onChange={(v) => set({ project_experience: updateAt(projects, i, { associated_company: v || null }) })} readOnly={readOnly} />
                <FieldInput label={f('projectRole')} value={entry.role ?? ''} onChange={(v) => set({ project_experience: updateAt(projects, i, { role: v || null }) })} readOnly={readOnly} />
                <FieldInput label={f('startDate')} value={entry.start_date ?? ''} onChange={(v) => set({ project_experience: updateAt(projects, i, { start_date: v || null }) })} readOnly={readOnly} />
                <FieldInput label={f('endDate')} value={entry.end_date ?? ''} onChange={(v) => set({ project_experience: updateAt(projects, i, { end_date: v || null }) })} readOnly={readOnly} />
              </div>
              <FieldInput label={f('description')} value={entry.description ?? ''} multiline onChange={(v) => set({ project_experience: updateAt(projects, i, { description: v || null }) })} readOnly={readOnly} />
            </div>
          ))}
          {!readOnly && <AddButton label={t('steps.reviewExtraction.addEntry')} onClick={() => set({ project_experience: [...projects, emptyProject] })} />}
        </div>
      </CollapsibleSection>

      {/* Skills */}
      <CollapsibleSection title={s('skills')}>
        <div className="space-y-2">
          {skills.map((entry, i) => (
            <div key={i} className="flex items-end gap-2">
              <div className="flex-1">
                <FieldInput label={f('skillName')} value={entry.name ?? ''} onChange={(v) => set({ skills: updateAt(skills, i, { name: v || null }) })} readOnly={readOnly} />
              </div>
              <div className="flex-1">
                <FieldInput label={f('skillLevel')} value={entry.level ?? ''} onChange={(v) => set({ skills: updateAt(skills, i, { level: v || null }) })} readOnly={readOnly} />
              </div>
              {!readOnly && <RemoveButton label={t('steps.reviewExtraction.removeEntry')} onClick={() => set({ skills: removeAt(skills, i) })} />}
            </div>
          ))}
          {!readOnly && <AddButton label={t('steps.reviewExtraction.addEntry')} onClick={() => set({ skills: [...skills, emptySkill] })} />}
        </div>
      </CollapsibleSection>

      {/* Certifications */}
      <CollapsibleSection title={s('certifications')}>
        <div className="space-y-2">
          {certs.map((entry, i) => (
            <div key={i} className="flex items-end gap-2">
              <div className="flex-1">
                <FieldInput label={f('certName')} value={entry.name ?? ''} onChange={(v) => set({ certifications: updateAt(certs, i, { name: v || null }) })} readOnly={readOnly} />
              </div>
              <div className="flex-1">
                <FieldInput label={f('certDate')} value={entry.date ?? ''} onChange={(v) => set({ certifications: updateAt(certs, i, { date: v || null }) })} readOnly={readOnly} />
              </div>
              {!readOnly && <RemoveButton label={t('steps.reviewExtraction.removeEntry')} onClick={() => set({ certifications: removeAt(certs, i) })} />}
            </div>
          ))}
          {!readOnly && <AddButton label={t('steps.reviewExtraction.addEntry')} onClick={() => set({ certifications: [...certs, emptyCert] })} />}
        </div>
      </CollapsibleSection>

      {/* Languages */}
      <CollapsibleSection title={s('languages')}>
        <div className="space-y-2">
          {langs.map((lang, i) => (
            <div key={i} className="flex items-end gap-2">
              <div className="flex-1">
                <FieldInput
                  label={`${s('languages')} ${i + 1}`}
                  value={lang}
                  onChange={(v) => {
                    const updated = [...langs];
                    updated[i] = v;
                    set({ languages: updated });
                  }}
                  readOnly={readOnly}
                />
              </div>
              {!readOnly && <RemoveButton label={t('steps.reviewExtraction.removeEntry')} onClick={() => set({ languages: removeAt(langs, i) })} />}
            </div>
          ))}
          {!readOnly && <AddButton label={t('steps.reviewExtraction.addEntry')} onClick={() => set({ languages: [...langs, ''] })} />}
        </div>
      </CollapsibleSection>

      {/* Portfolio Links */}
      <CollapsibleSection title={f('portfolioLinks')}>
        <div className="space-y-2">
          {portfolioLinks.map((link, i) => (
            <div key={i} className="flex items-end gap-2">
              <div className="flex-1">
                <FieldInput
                  label={`${f('portfolioLinks')} ${i + 1}`}
                  value={link}
                  onChange={(v) => {
                    const updated = [...portfolioLinks];
                    updated[i] = v;
                    set({ portfolio_links: updated });
                  }}
                  readOnly={readOnly}
                />
              </div>
              {!readOnly && <RemoveButton label={t('steps.reviewExtraction.removeEntry')} onClick={() => set({ portfolio_links: removeAt(portfolioLinks, i) })} />}
            </div>
          ))}
          {!readOnly && <AddButton label={t('steps.reviewExtraction.addEntry')} onClick={() => set({ portfolio_links: [...portfolioLinks, ''] })} />}
        </div>
      </CollapsibleSection>

      {/* Other */}
      <CollapsibleSection title={s('other')}>
        <div className="space-y-3">
          <FieldInput label={f('selfIntroduction')} value={data.self_introduction ?? ''} multiline onChange={(v) => set({ self_introduction: v || null })} readOnly={readOnly} />
          <FieldInput label={f('other')} value={data.other ?? ''} multiline onChange={(v) => set({ other: v || null })} readOnly={readOnly} />
        </div>
      </CollapsibleSection>
    </div>
  );
}
