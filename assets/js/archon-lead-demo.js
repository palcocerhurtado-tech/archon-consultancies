// Fixed fictional enquiries; no personal data, network requests or persistence.
const samples = Object.freeze({
  standard: { id: 'DEMO-001', company: 'Taller Ejemplo', source: 'Web', urgent: false },
  urgent: { id: 'DEMO-002', company: 'Comercio Ejemplo', source: 'Campaña', urgent: true },
  incomplete: { id: 'DEMO-003', company: 'Proyecto Ejemplo', source: '', urgent: false }
});

export function processSample(records, sampleKey) {
  const sample = Object.hasOwn(samples, sampleKey) ? samples[sampleKey] : null;
  if (!sample) throw new RangeError('Unknown demo sample');
  if (records.some(record => record.id === sample.id)) {
    return { records, event: 'duplicate', id: sample.id };
  }
  const record = {
    ...sample,
    priority: sample.urgent ? 'high' : 'normal',
    owner: 'Pablo',
    action: !sample.source ? 'review' : sample.urgent ? 'call' : 'reply'
  };
  return { records: [...records, record], event: !sample.source ? 'review' : 'registered', id: sample.id };
}

if (typeof document !== 'undefined') {
  const root = document.querySelector('[data-lead-demo]');
  if (root) {
    let records = [];
    let lastEvent = 'empty';
    let lastId = '';
    const output = root.querySelector('[data-demo-records]');
    const status = root.querySelector('[data-demo-status]');
    const copy = (es, en) => document.documentElement.lang === 'en' ? en : es;
    const messages = {
      empty: ['Elige una consulta ficticia para ver el recorrido.', 'Choose a fictional enquiry to see the flow.'],
      registered: ['Consulta registrada y próxima acción asignada. No se ha enviado ningún mensaje.', 'Enquiry recorded and next action assigned. No message has been sent.'],
      duplicate: ['La consulta ya existe. Se conserva un solo registro y su próxima acción.', 'The enquiry already exists. One record and its next action are retained.'],
      review: ['Falta el origen de la consulta. Se asigna revisión humana antes de continuar.', 'The enquiry source is missing. Human review is assigned before continuing.']
    };
    function render() {
      output.replaceChildren();
      for (const record of records) {
        const row = document.createElement('tr');
        const fields = [record.id, record.company,
          record.source === 'Campaña' ? copy('Campaña', 'Campaign') : record.source || copy('Sin origen', 'Missing source'),
          record.priority === 'high' ? copy('Alta', 'High') : copy('Normal', 'Normal'), record.owner,
          record.action === 'review' ? copy('Revisar origen', 'Review source')
            : record.action === 'call' ? copy('Preparar llamada', 'Prepare a call') : copy('Preparar respuesta', 'Prepare a reply')];
        for (const field of fields) {
          const cell = document.createElement('td');
          cell.textContent = field;
          row.append(cell);
        }
        output.append(row);
      }
      if (!records.length) {
        const row = document.createElement('tr');
        const cell = document.createElement('td');
        cell.colSpan = 6;
        cell.textContent = copy('Todavía no hay consultas en esta simulación.', 'There are no enquiries in this simulation yet.');
        row.append(cell);
        output.append(row);
      }
      status.textContent = (lastId ? lastId + ' · ' : '') + copy(...messages[lastEvent]);
    }
    root.querySelectorAll('[data-demo-sample]').forEach(button => {
      button.addEventListener('click', () => {
        const result = processSample(records, button.dataset.demoSample);
        records = result.records;
        lastEvent = result.event;
        lastId = result.id;
        render();
      });
    });
    root.querySelector('[data-demo-reset]').addEventListener('click', () => {
      records = [];
      lastEvent = 'empty';
      lastId = '';
      render();
    });
    new MutationObserver(render).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
    root.querySelector('[data-demo-controls]').hidden = false;
    render();
  }
}
