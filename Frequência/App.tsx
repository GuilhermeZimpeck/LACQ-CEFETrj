import { useState } from 'react'

type Student = {
  id: string
  name: string
  ra: string
  course: string
  phone: string
  email: string
}

type AttendanceRecord = {
  date: string
  records: Record<string, 'P' | 'F' | null>
}

type Comment = {
  id: string
  studentId: string
  date: string
  text: string
}

type Tab = 'cadastro' | 'frequencia' | 'comentarios'

const initialStudents: Student[] = [
  { id: '1', name: 'Ana Luiza Ferreira', ra: '2024001', course: 'Engenharia de Software', phone: '(11) 91234-5678', email: 'ana.ferreira@email.com' },
  { id: '2', name: 'Bruno Carvalho', ra: '2024002', course: 'Engenharia de Software', phone: '(11) 98765-4321', email: 'bruno.carvalho@email.com' },
  { id: '3', name: 'Camila Rocha', ra: '2024003', course: 'Engenharia de Software', phone: '(21) 99000-1122', email: 'camila.rocha@email.com' },
]

const initialAttendance: AttendanceRecord[] = [
  { date: '2026-08-01', records: { '1': 'P', '2': 'P', '3': 'F' } },
  { date: '2026-08-08', records: { '1': 'P', '2': 'F', '3': 'P' } },
]

export default function App() {
  const [tab, setTab] = useState<Tab>('frequencia')
  const [students, setStudents] = useState<Student[]>(initialStudents)
  const [attendance, setAttendance] = useState<AttendanceRecord[]>(initialAttendance)
  const [comments, setComments] = useState<Comment[]>([])
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null)

  // Cadastro form state
  const [form, setForm] = useState({ name: '', ra: '', course: '', phone: '', email: '' })
  const [formError, setFormError] = useState('')

  // Frequência: new date being added
  const [newDate, setNewDate] = useState('')
  const [addingDate, setAddingDate] = useState(false)

  // Comentários
  const [newComment, setNewComment] = useState('')

  function handleAddStudent() {
    if (!form.name.trim() || !form.ra.trim()) {
      setFormError('Nome e RA são obrigatórios.')
      return
    }
    if (students.some((s) => s.ra === form.ra.trim())) {
      setFormError('Já existe um estudante com esse RA.')
      return
    }
    const id = Date.now().toString()
    setStudents((prev) => [...prev, { id, name: form.name.trim(), ra: form.ra.trim(), course: form.course.trim(), phone: form.phone.trim(), email: form.email.trim() }])
    setForm({ name: '', ra: '', course: '', phone: '', email: '' })
    setFormError('')
  }

  function handleRemoveStudent(id: string) {
    setStudents((prev) => prev.filter((s) => s.id !== id))
    setAttendance((prev) => prev.map((a) => { const r = { ...a.records }; delete r[id]; return { ...a, records: r } }))
    setComments((prev) => prev.filter((c) => c.studentId !== id))
    if (selectedStudentId === id) setSelectedStudentId(null)
  }

  function handleToggleAttendance(date: string, studentId: string, current: 'P' | 'F' | null) {
    const next: 'P' | 'F' | null = current === null ? 'P' : current === 'P' ? 'F' : null
    setAttendance((prev) =>
      prev.map((a) => a.date === date ? { ...a, records: { ...a.records, [studentId]: next } } : a)
    )
  }

  function handleAddDate() {
    if (!newDate) return
    if (attendance.some((a) => a.date === newDate)) return
    setAttendance((prev) => [...prev, { date: newDate, records: {} }])
    setNewDate('')
    setAddingDate(false)
  }

  function handleRemoveDate(date: string) {
    setAttendance((prev) => prev.filter((a) => a.date !== date))
  }

  function calcAttendance(studentId: string) {
    const total = attendance.filter((a) => a.records[studentId] !== undefined).length
    const present = attendance.filter((a) => a.records[studentId] === 'P').length
    if (total === 0) return null
    return { present, total, pct: Math.round((present / total) * 100) }
  }

  function handleAddComment() {
    if (!newComment.trim() || !selectedStudentId) return
    setComments((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        studentId: selectedStudentId,
        date: new Date().toISOString().slice(0, 10),
        text: newComment.trim(),
      },
    ])
    setNewComment('')
  }

  function handleRemoveComment(id: string) {
    setComments((prev) => prev.filter((c) => c.id !== id))
  }

  const sortedDates = [...attendance].sort((a, b) => a.date.localeCompare(b.date))
  const selectedStudent = students.find((s) => s.id === selectedStudentId)
  const studentComments = comments.filter((c) => c.studentId === selectedStudentId)

  function formatDate(iso: string) {
    const [y, m, d] = iso.split('-')
    return `${d}/${m}/${y}`
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: 'cadastro', label: 'Cadastro' },
    { key: 'frequencia', label: 'Frequência' },
    { key: 'comentarios', label: 'Comentários' },
  ]

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', minHeight: '100vh', background: '#fff', color: '#111' }}>
      {/* Header */}
      <header style={{ borderBottom: '2px solid #111', padding: '0 32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 24, maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ padding: '18px 0 16px', flex: 1 }}>
            <span style={{ fontWeight: 700, fontSize: 15, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              Sistema de Frequência
            </span>
          </div>
          {/* Tabs */}
          <nav style={{ display: 'flex', gap: 0 }}>
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                style={{
                  background: 'none',
                  border: 'none',
                  borderBottom: tab === t.key ? '3px solid #1a6bff' : '3px solid transparent',
                  padding: '18px 20px 15px',
                  fontFamily: 'inherit',
                  fontSize: 13,
                  fontWeight: tab === t.key ? 600 : 400,
                  color: tab === t.key ? '#1a6bff' : '#555',
                  cursor: 'pointer',
                  letterSpacing: '0.04em',
                  transition: 'color 0.15s',
                }}
              >
                {t.label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 32px' }}>

        {/* ── CADASTRO ── */}
        {tab === 'cadastro' && (
          <div>
            <h2 style={{ fontSize: 13, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#888', marginBottom: 24 }}>
              Cadastro de Estudantes
            </h2>

            {/* Form */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 2fr', gap: 12, marginBottom: 12 }}>
              <div>
                <label style={labelStyle}>Nome completo</label>
                <input
                  style={inputStyle}
                  placeholder="Ex: João da Silva"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddStudent()}
                />
              </div>
              <div>
                <label style={labelStyle}>RA</label>
                <input
                  style={inputStyle}
                  placeholder="Ex: 2024001"
                  value={form.ra}
                  onChange={(e) => setForm((f) => ({ ...f, ra: e.target.value }))}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddStudent()}
                />
              </div>
              <div>
                <label style={labelStyle}>Curso</label>
                <input
                  style={inputStyle}
                  placeholder="Ex: Engenharia de Software"
                  value={form.course}
                  onChange={(e) => setForm((f) => ({ ...f, course: e.target.value }))}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddStudent()}
                />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: 12, marginBottom: 8, alignItems: 'end' }}>
              <div>
                <label style={labelStyle}>Telefone</label>
                <input
                  style={inputStyle}
                  placeholder="Ex: (11) 91234-5678"
                  value={form.phone}
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddStudent()}
                />
              </div>
              <div>
                <label style={labelStyle}>E-mail</label>
                <input
                  type="email"
                  style={inputStyle}
                  placeholder="Ex: joao@email.com"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddStudent()}
                />
              </div>
              <button onClick={handleAddStudent} style={primaryBtnStyle}>
                Adicionar
              </button>
            </div>
            {formError && <p style={{ color: '#dc2626', fontSize: 12, marginBottom: 16 }}>{formError}</p>}

            {/* Table */}
            <div style={{ marginTop: 24, border: '1px solid #e5e5e5', borderRadius: 4, overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ background: '#f5f5f5', borderBottom: '1px solid #e5e5e5' }}>
                    <th style={thStyle}>#</th>
                    <th style={thStyle}>Nome</th>
                    <th style={thStyle}>RA</th>
                    <th style={thStyle}>Curso</th>
                    <th style={thStyle}>Telefone</th>
                    <th style={thStyle}>E-mail</th>
                    <th style={{ ...thStyle, width: 60 }}></th>
                  </tr>
                </thead>
                <tbody>
                  {students.length === 0 && (
                    <tr>
                      <td colSpan={7} style={{ textAlign: 'center', padding: '32px', color: '#aaa', fontSize: 13 }}>
                        Nenhum estudante cadastrado.
                      </td>
                    </tr>
                  )}
                  {students.map((s, i) => (
                    <tr key={s.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                      <td style={{ ...tdStyle, fontFamily: 'JetBrains Mono, monospace', color: '#aaa', width: 40 }}>{i + 1}</td>
                      <td style={{ ...tdStyle, fontWeight: 500 }}>{s.name}</td>
                      <td style={{ ...tdStyle, fontFamily: 'JetBrains Mono, monospace', color: '#555' }}>{s.ra}</td>
                      <td style={{ ...tdStyle, color: '#666' }}>{s.course || '—'}</td>
                      <td style={{ ...tdStyle, fontFamily: 'JetBrains Mono, monospace', color: '#555', fontSize: 12 }}>{s.phone || '—'}</td>
                      <td style={{ ...tdStyle, fontFamily: 'JetBrains Mono, monospace', color: '#555', fontSize: 12 }}>{s.email || '—'}</td>
                      <td style={tdStyle}>
                        <button
                          onClick={() => handleRemoveStudent(s.id)}
                          style={{ background: 'none', border: 'none', color: '#ccc', cursor: 'pointer', fontSize: 16, lineHeight: 1, padding: '0 4px' }}
                          title="Remover estudante"
                        >
                          ×
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p style={{ color: '#aaa', fontSize: 12, marginTop: 10 }}>{students.length} estudante{students.length !== 1 ? 's' : ''} cadastrado{students.length !== 1 ? 's' : ''}.</p>
          </div>
        )}

        {/* ── FREQUÊNCIA ── */}
        {tab === 'frequencia' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
              <h2 style={{ fontSize: 13, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#888', margin: 0 }}>
                Registro de Frequência
              </h2>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                {addingDate ? (
                  <>
                    <input
                      type="date"
                      style={{ ...inputStyle, width: 160 }}
                      value={newDate}
                      onChange={(e) => setNewDate(e.target.value)}
                    />
                    <button onClick={handleAddDate} style={primaryBtnStyle}>Confirmar</button>
                    <button onClick={() => { setAddingDate(false); setNewDate('') }} style={ghostBtnStyle}>Cancelar</button>
                  </>
                ) : (
                  <button onClick={() => setAddingDate(true)} style={primaryBtnStyle}>+ Nova data</button>
                )}
              </div>
            </div>

            {students.length === 0 ? (
              <EmptyState text="Cadastre estudantes antes de registrar frequência." />
            ) : sortedDates.length === 0 ? (
              <EmptyState text="Nenhuma data cadastrada. Adicione uma data acima." />
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ borderCollapse: 'collapse', fontSize: 13, minWidth: 600 }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #111' }}>
                      <th style={{ ...thStyle, textAlign: 'left', minWidth: 200, position: 'sticky', left: 0, background: '#fff', zIndex: 1 }}>
                        Estudante
                      </th>
                      {sortedDates.map((a) => (
                        <th key={a.date} style={{ ...thStyle, minWidth: 90, textAlign: 'center', fontFamily: 'JetBrains Mono, monospace', fontWeight: 500, fontSize: 11 }}>
                          <div>{formatDate(a.date)}</div>
                          <button
                            onClick={() => handleRemoveDate(a.date)}
                            style={{ background: 'none', border: 'none', color: '#ccc', cursor: 'pointer', fontSize: 14, lineHeight: 1, padding: '2px', marginTop: 2 }}
                            title="Remover data"
                          >×</button>
                        </th>
                      ))}
                      <th style={{ ...thStyle, minWidth: 90, textAlign: 'center' }}>%</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((s) => {
                      const stats = calcAttendance(s.id)
                      return (
                        <tr key={s.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                          <td style={{ ...tdStyle, position: 'sticky', left: 0, background: '#fff', zIndex: 1 }}>
                            <div style={{ fontWeight: 500 }}>{s.name}</div>
                            <div style={{ fontFamily: 'JetBrains Mono, monospace', color: '#aaa', fontSize: 11 }}>{s.ra}</div>
                          </td>
                          {sortedDates.map((a) => {
                            const val = a.records[s.id] ?? null
                            return (
                              <td key={a.date} style={{ ...tdStyle, textAlign: 'center' }}>
                                <button
                                  onClick={() => handleToggleAttendance(a.date, s.id, val)}
                                  style={{
                                    width: 36,
                                    height: 36,
                                    border: '1px solid',
                                    borderRadius: 4,
                                    fontFamily: 'JetBrains Mono, monospace',
                                    fontWeight: 600,
                                    fontSize: 13,
                                    cursor: 'pointer',
                                    transition: 'all 0.12s',
                                    borderColor: val === 'P' ? '#16a34a' : val === 'F' ? '#dc2626' : '#e0e0e0',
                                    background: val === 'P' ? '#f0fdf4' : val === 'F' ? '#fef2f2' : '#fafafa',
                                    color: val === 'P' ? '#16a34a' : val === 'F' ? '#dc2626' : '#ccc',
                                  }}
                                  title={val === null ? 'Clique para marcar P' : val === 'P' ? 'Clique para marcar F' : 'Clique para limpar'}
                                >
                                  {val ?? '·'}
                                </button>
                              </td>
                            )
                          })}
                          <td style={{ ...tdStyle, textAlign: 'center' }}>
                            {stats ? (
                              <div>
                                <div style={{
                                  fontFamily: 'JetBrains Mono, monospace',
                                  fontWeight: 600,
                                  fontSize: 14,
                                  color: stats.pct >= 75 ? '#16a34a' : stats.pct >= 50 ? '#d97706' : '#dc2626',
                                }}>
                                  {stats.pct}%
                                </div>
                                <div style={{ fontFamily: 'JetBrains Mono, monospace', color: '#aaa', fontSize: 10 }}>
                                  {stats.present}/{stats.total}
                                </div>
                              </div>
                            ) : (
                              <span style={{ color: '#ccc', fontSize: 12 }}>—</span>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Legend */}
            <div style={{ display: 'flex', gap: 20, marginTop: 20, fontSize: 12, color: '#888' }}>
              <span><span style={{ fontFamily: 'JetBrains Mono, monospace', color: '#16a34a', fontWeight: 600 }}>P</span> = Presente</span>
              <span><span style={{ fontFamily: 'JetBrains Mono, monospace', color: '#dc2626', fontWeight: 600 }}>F</span> = Faltoso</span>
              <span><span style={{ fontFamily: 'JetBrains Mono, monospace', color: '#ccc' }}>·</span> = Não preenchido</span>
              <span style={{ marginLeft: 'auto' }}>Clique para alternar: vazio → P → F → vazio</span>
            </div>
          </div>
        )}

        {/* ── COMENTÁRIOS ── */}
        {tab === 'comentarios' && (
          <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 32, minHeight: 400 }}>
            {/* Student list */}
            <div>
              <h2 style={{ fontSize: 13, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#888', marginBottom: 16 }}>
                Estudante
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {students.length === 0 && (
                  <p style={{ color: '#aaa', fontSize: 13 }}>Nenhum estudante cadastrado.</p>
                )}
                {students.map((s) => {
                  const count = comments.filter((c) => c.studentId === s.id).length
                  return (
                    <button
                      key={s.id}
                      onClick={() => setSelectedStudentId(s.id)}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-start',
                        gap: 2,
                        padding: '10px 12px',
                        border: '1px solid',
                        borderRadius: 4,
                        borderColor: selectedStudentId === s.id ? '#1a6bff' : '#e5e5e5',
                        background: selectedStudentId === s.id ? '#e8f0ff' : '#fff',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'all 0.12s',
                        fontFamily: 'inherit',
                      }}
                    >
                      <span style={{ fontWeight: 500, fontSize: 13, color: selectedStudentId === s.id ? '#1a6bff' : '#111' }}>{s.name}</span>
                      <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: '#aaa' }}>
                        {s.ra} · {count} comentário{count !== 1 ? 's' : ''}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Comment panel */}
            <div>
              {!selectedStudentId ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#ccc', fontSize: 14 }}>
                  Selecione um estudante.
                </div>
              ) : (
                <>
                  <div style={{ marginBottom: 20 }}>
                    <h2 style={{ fontSize: 13, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#888', margin: 0 }}>
                      Comentários — {selectedStudent?.name}
                    </h2>
                  </div>

                  {/* Add comment */}
                  <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
                    <textarea
                      rows={2}
                      style={{
                        ...inputStyle,
                        flex: 1,
                        resize: 'vertical',
                        minHeight: 60,
                      }}
                      placeholder="Escreva um comentário sobre este estudante..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                    />
                    <button onClick={handleAddComment} style={{ ...primaryBtnStyle, alignSelf: 'flex-end' }}>
                      Adicionar
                    </button>
                  </div>

                  {/* Comment list */}
                  {studentComments.length === 0 ? (
                    <p style={{ color: '#aaa', fontSize: 13 }}>Nenhum comentário ainda.</p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {[...studentComments].reverse().map((c) => (
                        <div key={c.id} style={{ border: '1px solid #e5e5e5', borderRadius: 4, padding: '12px 16px', background: '#fafafa' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                            <p style={{ margin: 0, fontSize: 13, lineHeight: 1.6, color: '#222', flex: 1 }}>{c.text}</p>
                            <button
                              onClick={() => handleRemoveComment(c.id)}
                              style={{ background: 'none', border: 'none', color: '#ccc', cursor: 'pointer', fontSize: 16, lineHeight: 1, flexShrink: 0, padding: '0 2px' }}
                            >×</button>
                          </div>
                          <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: '#aaa', marginTop: 8 }}>
                            {formatDate(c.date)}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

function EmptyState({ text }: { text: string }) {
  return (
    <div style={{ textAlign: 'center', padding: '48px 32px', color: '#bbb', fontSize: 13, border: '1px dashed #e5e5e5', borderRadius: 4 }}>
      {text}
    </div>
  )
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 11,
  fontWeight: 600,
  letterSpacing: '0.06em',
  textTransform: 'uppercase',
  color: '#888',
  marginBottom: 6,
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '8px 10px',
  border: '1px solid #d5d5d5',
  borderRadius: 4,
  fontFamily: 'Inter, sans-serif',
  fontSize: 13,
  color: '#111',
  background: '#fff',
  outline: 'none',
}

const primaryBtnStyle: React.CSSProperties = {
  padding: '8px 18px',
  background: '#1a6bff',
  color: '#fff',
  border: 'none',
  borderRadius: 4,
  fontFamily: 'Inter, sans-serif',
  fontSize: 13,
  fontWeight: 600,
  cursor: 'pointer',
  whiteSpace: 'nowrap',
}

const ghostBtnStyle: React.CSSProperties = {
  padding: '8px 14px',
  background: '#fff',
  color: '#555',
  border: '1px solid #d5d5d5',
  borderRadius: 4,
  fontFamily: 'Inter, sans-serif',
  fontSize: 13,
  cursor: 'pointer',
  whiteSpace: 'nowrap',
}

const thStyle: React.CSSProperties = {
  padding: '10px 12px',
  fontWeight: 600,
  fontSize: 11,
  letterSpacing: '0.06em',
  textTransform: 'uppercase',
  color: '#888',
  textAlign: 'left',
}

const tdStyle: React.CSSProperties = {
  padding: '10px 12px',
  verticalAlign: 'middle',
}
