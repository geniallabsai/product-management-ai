def build_delivery_kanban(objective: str, horizon: str = '90 dias') -> dict:
    return {
        'objective': objective,
        'horizon': horizon,
        'lanes': {
            'backlog': ['Diagnóstico', 'Mapa de processos', 'Canvas', 'Stack recomendada'],
            'todo': ['Entrevistas', 'PUV', 'MVP scope'],
            'doing': ['Protótipo', 'GTM experimental'],
            'validation': ['Métricas', 'Teste com cliente'],
            'done': [],
        },
        'cadence': ['Daily curta', 'Review semanal', 'Retro quinzenal', 'Planejamento 30/90 dias']
    }
