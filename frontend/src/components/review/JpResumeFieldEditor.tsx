import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type {
  JpResumeData,
  JpPersonalInfo,
  JpEducationEntry,
  JpWorkEntry,
  JpSkillEntry,
  JpCertificationEntry,
} from '../../types/resume';
import { toWareki } from '../../utils/wareki';
import { mapDegreeToJapanese } from '../../utils/credentials';
import { FieldTooltip } from '../ui/FieldTooltip';

interface JpResumeFieldEditorProps {
  data: JpResumeData;
  onChange: (updated: JpResumeData) => void;
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
  title: React.ReactNode;
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
  helperText,
  helperClassName = 'text-xs text-gray-500',
}: {
  label: React.ReactNode;
  value: string;
  onChange: (v: string) => void;
  multiline?: boolean;
  helperText?: string;
  helperClassName?: string;
}) {
  const cls =
    'w-full rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-800 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none';
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-slate-500">{label}</span>
      {multiline ? (
        <textarea rows={3} className={cls} value={value} onChange={(e) => onChange(e.target.value)} />
      ) : (
        <input type="text" className={cls} value={value} onChange={(e) => onChange(e.target.value)} />
      )}
      {helperText && <p className={helperClassName}>{helperText}</p>}
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

function warekiHelper(value: string | null | undefined): string {
  if (!value) return '';
  return toWareki(value);
}

function degreeHelper(value: string | null | undefined): string | undefined {
  if (!value) return undefined;
  const mapped = mapDegreeToJapanese(value);
  return mapped !== value ? mapped : undefined;
}

export default function JpResumeFieldEditor({ data, onChange }: JpResumeFieldEditorProps) {
  const { t } = useTranslation('wizard');
  const f = (key: string) => t(`reviewTranslation.fields.${key}`);
  const s = (key: string) => t(`reviewTranslation.sections.${key}`);
  const tip = (key: string) => t(`cultureTips.${key}`);

  const setData = (patch: Partial<JpResumeData>) => onChange({ ...data, ...patch });

  const pi = data.personal_info ?? {};
  const setPI = (patch: Partial<JpPersonalInfo>) =>
    setData({ personal_info: { ...pi, ...patch } });

  const education = data.education ?? [];
  const workHistory = data.work_history ?? [];
  const skills = data.skills ?? [];
  const certs = data.certifications ?? [];

  const emptyEdu: JpEducationEntry = { school: null, degree: null, major: null, start_date: null, end_date: null };
  const emptyWork: JpWorkEntry = { company: null, title: null, start_date: null, end_date: null, responsibilities: [], achievements: [] };
  const emptySkill: JpSkillEntry = { category: null, skills: [] };
  const emptyCert: JpCertificationEntry = { name: null, date: null };

  return (
    <div className="space-y-3">
      {/* Personal Info */}
      <CollapsibleSection title={s('personalInfo')}>
        <div className="grid grid-cols-2 gap-3">
          <FieldInput label={f('name')} value={pi.name ?? ''} onChange={(v) => setPI({ name: v || null })} />
          <FieldInput
            label={<FieldTooltip content={tip('name_katakana')}>{f('nameKatakana')}</FieldTooltip>}
            value={pi.name_katakana ?? ''}
            onChange={(v) => setPI({ name_katakana: v || null })}
          />
          <FieldInput
            label={f('birthDate')}
            value={pi.birth_date ?? ''}
            onChange={(v) => setPI({ birth_date: v || null })}
            helperText={warekiHelper(pi.birth_date)}
          />
          <FieldInput label={f('gender')} value={pi.gender ?? ''} onChange={(v) => setPI({ gender: v || null })} />
          <FieldInput label={f('nationality')} value={pi.nationality ?? ''} onChange={(v) => setPI({ nationality: v || null })} />
          <FieldInput label={f('address')} value={pi.address ?? ''} onChange={(v) => setPI({ address: v || null })} />
          <FieldInput label={f('phone')} value={pi.phone ?? ''} onChange={(v) => setPI({ phone: v || null })} />
          <FieldInput label={f('email')} value={pi.email ?? ''} onChange={(v) => setPI({ email: v || null })} />
          <FieldInput label={f('age')} value={pi.age ?? ''} onChange={(v) => setPI({ age: v || null })} />
          <FieldInput label={f('emergencyContactAddress')} value={pi.emergency_contact_address ?? ''} onChange={(v) => setPI({ emergency_contact_address: v || null })} />
          <FieldInput label={f('maritalStatus')} value={pi.marital_status ?? ''} onChange={(v) => setPI({ marital_status: v || null })} />
          <FieldInput label={f('dependentsCount')} value={pi.dependents_count ?? ''} onChange={(v) => setPI({ dependents_count: v || null })} />
          <FieldInput label={f('commuteTime')} value={pi.commute_time ?? ''} onChange={(v) => setPI({ commute_time: v || null })} />
        </div>
      </CollapsibleSection>

      {/* Summary */}
      <CollapsibleSection title={<FieldTooltip content={tip('summary')}>{s('summary')}</FieldTooltip>}>
        <FieldInput
          label={f('summary')}
          value={data.summary ?? ''}
          onChange={(v) => setData({ summary: v || null })}
          multiline
        />
      </CollapsibleSection>

      {/* Motivation */}
      <CollapsibleSection title={<FieldTooltip content={tip('motivation')}>{s('motivation')}</FieldTooltip>}>
        <FieldInput
          label={f('motivation')}
          value={data.motivation ?? ''}
          onChange={(v) => setData({ motivation: v || null })}
          multiline
        />
      </CollapsibleSection>

      {/* Strengths */}
      <CollapsibleSection title={s('strengths')}>
        <FieldInput
          label={f('strengths')}
          value={data.strengths ?? ''}
          onChange={(v) => setData({ strengths: v || null })}
          multiline
        />
      </CollapsibleSection>

      {/* Education */}
      <CollapsibleSection title={<FieldTooltip content={tip('degree')}>{s('education')}</FieldTooltip>}>
        <div className="space-y-3">
          {education.map((entry, i) => (
            <div key={i} className="space-y-2 rounded-md border border-slate-100 bg-slate-50 p-3">
              <div className="flex justify-end">
                <RemoveButton label={t('reviewTranslation.removeEntry')} onClick={() => setData({ education: removeAt(education, i) })} />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <FieldInput label={f('school')} value={entry.school ?? ''} onChange={(v) => setData({ education: updateAt(education, i, { school: v || null }) })} />
                <FieldInput
                  label={f('degree')}
                  value={entry.degree ?? ''}
                  onChange={(v) => setData({ education: updateAt(education, i, { degree: v || null }) })}
                  helperText={degreeHelper(entry.degree)}
                  helperClassName="text-xs text-blue-600"
                />
                <FieldInput label={f('major')} value={entry.major ?? ''} onChange={(v) => setData({ education: updateAt(education, i, { major: v || null }) })} />
                <FieldInput
                  label={f('startDate')}
                  value={entry.start_date ?? ''}
                  onChange={(v) => setData({ education: updateAt(education, i, { start_date: v || null }) })}
                  helperText={warekiHelper(entry.start_date)}
                />
                <FieldInput
                  label={f('endDate')}
                  value={entry.end_date ?? ''}
                  onChange={(v) => setData({ education: updateAt(education, i, { end_date: v || null }) })}
                  helperText={warekiHelper(entry.end_date)}
                />
              </div>
            </div>
          ))}
          <AddButton label={t('reviewTranslation.addEntry')} onClick={() => setData({ education: [...education, emptyEdu] })} />
        </div>
      </CollapsibleSection>

      {/* Work History */}
      <CollapsibleSection title={s('workHistory')}>
        <div className="space-y-3">
          {workHistory.map((entry, i) => (
            <div key={i} className="space-y-2 rounded-md border border-slate-100 bg-slate-50 p-3">
              <div className="flex justify-end">
                <RemoveButton label={t('reviewTranslation.removeEntry')} onClick={() => setData({ work_history: removeAt(workHistory, i) })} />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <FieldInput label={f('company')} value={entry.company ?? ''} onChange={(v) => setData({ work_history: updateAt(workHistory, i, { company: v || null }) })} />
                <FieldInput label={f('title')} value={entry.title ?? ''} onChange={(v) => setData({ work_history: updateAt(workHistory, i, { title: v || null }) })} />
                <FieldInput
                  label={f('startDate')}
                  value={entry.start_date ?? ''}
                  onChange={(v) => setData({ work_history: updateAt(workHistory, i, { start_date: v || null }) })}
                  helperText={warekiHelper(entry.start_date)}
                />
                <FieldInput
                  label={f('endDate')}
                  value={entry.end_date ?? ''}
                  onChange={(v) => setData({ work_history: updateAt(workHistory, i, { end_date: v || null }) })}
                  helperText={warekiHelper(entry.end_date)}
                />
              </div>
              <FieldInput
                label={f('responsibilities')}
                value={(entry.responsibilities ?? []).join('\n')}
                onChange={(v) => setData({ work_history: updateAt(workHistory, i, { responsibilities: v ? v.split('\n') : [] }) })}
                multiline
              />
              <FieldInput
                label={f('achievements')}
                value={(entry.achievements ?? []).join('\n')}
                onChange={(v) => setData({ work_history: updateAt(workHistory, i, { achievements: v ? v.split('\n') : [] }) })}
                multiline
              />
            </div>
          ))}
          <AddButton label={t('reviewTranslation.addEntry')} onClick={() => setData({ work_history: [...workHistory, emptyWork] })} />
        </div>
      </CollapsibleSection>

      {/* Skills */}
      <CollapsibleSection title={<FieldTooltip content={tip('skills')}>{s('skills')}</FieldTooltip>}>
        <div className="space-y-2">
          {skills.map((entry, i) => (
            <div key={i} className="flex items-end gap-2">
              <div className="flex-1">
                <FieldInput label={f('category')} value={entry.category ?? ''} onChange={(v) => setData({ skills: updateAt(skills, i, { category: v || null }) })} />
              </div>
              <div className="flex-1">
                <FieldInput
                  label={f('skills')}
                  value={(entry.skills ?? []).join(', ')}
                  onChange={(v) => setData({ skills: updateAt(skills, i, { skills: v ? v.split(',').map((s) => s.trim()) : [] }) })}
                />
              </div>
              <RemoveButton label={t('reviewTranslation.removeEntry')} onClick={() => setData({ skills: removeAt(skills, i) })} />
            </div>
          ))}
          <AddButton label={t('reviewTranslation.addEntry')} onClick={() => setData({ skills: [...skills, emptySkill] })} />
        </div>
      </CollapsibleSection>

      {/* Certifications */}
      <CollapsibleSection title={<FieldTooltip content={tip('certifications')}>{s('certifications')}</FieldTooltip>}>
        <div className="space-y-3">
          {certs.map((entry, i) => (
            <div key={i} className="space-y-2 rounded-md border border-slate-100 bg-slate-50 p-3">
              <div className="flex justify-end">
                <RemoveButton label={t('reviewTranslation.removeEntry')} onClick={() => setData({ certifications: removeAt(certs, i) })} />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <FieldInput label={f('certName')} value={entry.name ?? ''} onChange={(v) => setData({ certifications: updateAt(certs, i, { name: v || null }) })} />
                <FieldInput
                  label={f('date')}
                  value={entry.date ?? ''}
                  onChange={(v) => setData({ certifications: updateAt(certs, i, { date: v || null }) })}
                  helperText={warekiHelper(entry.date)}
                />
              </div>
            </div>
          ))}
          <AddButton label={t('reviewTranslation.addEntry')} onClick={() => setData({ certifications: [...certs, emptyCert] })} />
        </div>
      </CollapsibleSection>

      {/* Other */}
      <CollapsibleSection title={s('other')}>
        <div className="space-y-3">
          <FieldInput
            label={f('desiredConditions')}
            value={data.desired_conditions ?? ''}
            onChange={(v) => setData({ desired_conditions: v || null })}
            multiline
          />
          <FieldInput
            label={f('other')}
            value={data.other ?? ''}
            onChange={(v) => setData({ other: v || null })}
            multiline
          />
        </div>
      </CollapsibleSection>

      {/* Personal Projects */}
      <CollapsibleSection title={s('personalProjects')}>
        <div className="space-y-3">
          {(data.personal_projects ?? []).map((project, i) => (
            <div key={i} className="space-y-2 rounded-md border border-slate-100 bg-slate-50 p-3">
              <div className="flex justify-end">
                <RemoveButton label={t('reviewTranslation.removeEntry')} onClick={() => setData({ personal_projects: removeAt(data.personal_projects ?? [], i) })} />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <FieldInput label={f('projectName')} value={project.name ?? ''} onChange={(v) => setData({ personal_projects: updateAt(data.personal_projects ?? [], i, { name: v || null }) })} />
                <FieldInput label={f('projectRole')} value={project.role ?? ''} onChange={(v) => setData({ personal_projects: updateAt(data.personal_projects ?? [], i, { role: v || null }) })} />
                <FieldInput label={f('startDate')} value={project.start_date ?? ''} onChange={(v) => setData({ personal_projects: updateAt(data.personal_projects ?? [], i, { start_date: v || null }) })} />
                <FieldInput label={f('endDate')} value={project.end_date ?? ''} onChange={(v) => setData({ personal_projects: updateAt(data.personal_projects ?? [], i, { end_date: v || null }) })} />
              </div>
              <FieldInput label={f('projectDescription')} value={project.description ?? ''} onChange={(v) => setData({ personal_projects: updateAt(data.personal_projects ?? [], i, { description: v || null }) })} multiline />
              <FieldInput label={f('projectTechnologies')} value={(project.technologies ?? []).join(', ')} onChange={(v) => setData({ personal_projects: updateAt(data.personal_projects ?? [], i, { technologies: v ? v.split(',').map((s) => s.trim()) : [] }) })} />
            </div>
          ))}
          <AddButton label={t('reviewTranslation.addEntry')} onClick={() => setData({ personal_projects: [...(data.personal_projects ?? []), { name: null, role: null, start_date: null, end_date: null, description: null, technologies: null }] })} />
        </div>
      </CollapsibleSection>
    </div>
  );
}
