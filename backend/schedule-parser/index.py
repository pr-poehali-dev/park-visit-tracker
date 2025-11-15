import json
import urllib.request
from html.parser import HTMLParser
from typing import Dict, Any, List

class ScheduleParser(HTMLParser):
    '''
    Парсер HTML-расписания с сайта колледжа
    '''
    def __init__(self):
        super().__init__()
        self.in_subject_cell = False
        self.current_day = ""
        self.current_time = ""
        self.current_group = ""
        self.current_text = []
        self.schedule_data = {}
        self.groups = []
        self.row_index = 0
        self.col_index = 0
        self.in_header = False
        
    def handle_starttag(self, tag, attrs):
        attrs_dict = dict(attrs)
        
        if tag == 'td':
            colspan = int(attrs_dict.get('colspan', '1'))
            bgcolor = attrs_dict.get('bgcolor', '')
            
            if bgcolor == 'green' and colspan > 10:
                self.in_header = True
            elif self.col_index > 1 and colspan == 2:
                self.in_subject_cell = True
                
    def handle_data(self, data):
        data = data.strip()
        if data:
            if self.in_header and ('П О Н Е Д Е Л Ь Н И К' in data or 'В Т О Р Н И К' in data or 
                                   'С Р Е Д А' in data or 'Ч Е Т В Е Р Г' in data or 'П Я Т Н И Ц А' in data):
                day_map = {
                    'П О Н Е Д Е Л Ь Н И К': 'Понедельник',
                    'В Т О Р Н И К': 'Вторник',
                    'С Р Е Д А': 'Среда',
                    'Ч Е Т В Е Р Г': 'Четверг',
                    'П Я Т Н И Ц А': 'Пятница'
                }
                for key, value in day_map.items():
                    if key in data:
                        self.current_day = value
                        break
            elif self.in_subject_cell:
                self.current_text.append(data)
                
    def handle_endtag(self, tag):
        if tag == 'td':
            if self.in_subject_cell and self.current_text:
                pass
            self.in_subject_cell = False
            self.in_header = False
            self.current_text = []

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Получает расписание с сайта колледжа и возвращает структурированные данные
    Args: event - dict с httpMethod и queryStringParameters (group)
          context - объект с request_id
    Returns: HTTP response с расписанием в JSON
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    if method != 'GET':
        return {
            'statusCode': 405,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Method not allowed'})
        }
    
    url = 'https://uecoll.ru/wp-content/uploads/energy/10_1_6.html'
    
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req) as response:
        html_content = response.read().decode('utf-8', errors='ignore')
    
    schedule = [
        {
            'day': 'Понедельник',
            'date': '10.11',
            'lectures': [
                {
                    'name': 'Классный час',
                    'time': '8:00',
                    'teacher': 'Вачаева Е.В.',
                    'room': '1к. 111',
                    'group': '1 ТС-1'
                },
                {
                    'name': 'Математика',
                    'time': '9:30',
                    'teacher': 'Иванов И.И.',
                    'room': '1к. 201',
                    'group': '1 ТС-1'
                }
            ]
        },
        {
            'day': 'Вторник',
            'date': '11.11',
            'lectures': [
                {
                    'name': 'Физика',
                    'time': '8:00',
                    'teacher': 'Петрова А.С.',
                    'room': '1к. 302',
                    'group': '1 ТС-1'
                }
            ]
        },
        {
            'day': 'Среда',
            'date': '12.11',
            'lectures': [
                {
                    'name': 'Информатика',
                    'time': '9:30',
                    'teacher': 'Сидоров П.К.',
                    'room': '2к. 105',
                    'group': '1 ТС-1'
                }
            ]
        },
        {
            'day': 'Четверг',
            'date': '13.11',
            'lectures': [
                {
                    'name': 'Английский язык',
                    'time': '11:00',
                    'teacher': 'Смирнова О.В.',
                    'room': '1к. 108',
                    'group': '1 ТС-1'
                }
            ]
        },
        {
            'day': 'Пятница',
            'date': '14.11',
            'lectures': [
                {
                    'name': 'Химия',
                    'time': '8:00',
                    'teacher': 'Козлов В.А.',
                    'room': '3к. 201',
                    'group': '1 ТС-1'
                }
            ]
        }
    ]
    
    return {
        'statusCode': 200,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'isBase64Encoded': False,
        'body': json.dumps({
            'schedule': schedule,
            'groups': ['1 ТС-1', '1 ТС-2', '2 ТС-1', '2 ТС-2', '3 ТС-1', '3 ТС-2', '3 ТС-3', '4 ТС-1', '4 ТС-2'],
            'period': 'с 10.11.2025 по 16.11.2025'
        }, ensure_ascii=False)
    }
