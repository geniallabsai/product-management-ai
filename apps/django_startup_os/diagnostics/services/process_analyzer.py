OTE_LAYERS = ('operational', 'tactical', 'strategic')

FAILURE_SIGNALS = {
    'no_owner': ['sem dono', 'ninguém cuida', 'responsável indefinido'],
    'manual_rework': ['manual', 'retrabalho', 'planilha', 'copiar e colar'],
    'no_metric': ['sem métrica', 'não mede', 'não sabe', 'sem indicador'],
    'bottleneck': ['demora', 'fila', 'gargalo', 'atraso', 'parou'],
    'handoff': ['passagem', 'handoff', 'entre áreas', 'comercial para operação'],
}

def classify_ote(process_name: str, description: str = '') -> str:
    text = f'{process_name} {description}'.lower()
    if any(word in text for word in ['meta', 'diretoria', 'estratégia', 'posicionamento', 'budget']):
        return 'strategic'
    if any(word in text for word in ['gestão', 'gerente', 'coordenação', 'funil', 'indicador', 'crm']):
        return 'tactical'
    return 'operational'

def detect_failure_modes(text: str) -> list[str]:
    lower = text.lower()
    modes = []
    for mode, signals in FAILURE_SIGNALS.items():
        if any(signal in lower for signal in signals):
            modes.append(mode)
    if not modes:
        modes.append('needs_mapping')
    return modes

def suggest_ai_placement(process_name: str, failure_modes: list[str]) -> str:
    if 'no_metric' in failure_modes:
        return 'Agente de dados para capturar eventos, gerar dashboard e alertas.'
    if 'manual_rework' in failure_modes:
        return 'Automação com IA para triagem, classificação, preenchimento e follow-up.'
    if 'handoff' in failure_modes:
        return 'Copiloto de processo para padronizar passagem entre áreas.'
    if 'bottleneck' in failure_modes:
        return 'Agente operacional para identificar fila, atraso e causa raiz.'
    return 'Primeiro mapear SOP e métrica; depois avaliar IA.'

def analyze_processes(processes: list[dict]) -> list[dict]:
    diagnostics = []
    for item in processes:
        name = item.get('name') or item.get('title') or 'Processo sem nome'
        description = item.get('description', '')
        modes = detect_failure_modes(f'{name} {description}')
        diagnostics.append({
            'process': name,
            'ote_layer': classify_ote(name, description),
            'failure_modes': modes,
            'ai_placement': suggest_ai_placement(name, modes),
            'metric': item.get('metric') or 'Definir tempo, volume, taxa de erro e conversão',
        })
    return diagnostics
