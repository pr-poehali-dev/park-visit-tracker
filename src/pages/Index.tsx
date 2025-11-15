import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';

interface Lecture {
  id: number;
  name: string;
  time: string;
  teacher: string;
  room: string;
  attended: boolean | null;
  date: string;
}

interface Subject {
  name: string;
  total: number;
  attended: number;
  color: string;
}

interface ScheduleLecture {
  name: string;
  time: string;
  teacher: string;
  room: string;
  group: string;
}

interface ScheduleDay {
  day: string;
  date: string;
  lectures: ScheduleLecture[];
}

const Index = () => {
  const [selectedGroup, setSelectedGroup] = useState<string>('1 ТС-1');
  const [availableGroups, setAvailableGroups] = useState<string[]>(['1 ТС-1', '1 ТС-2', '2 ТС-1', '2 ТС-2', '3 ТС-1', '3 ТС-2', '3 ТС-3', '4 ТС-1', '4 ТС-2']);
  const [scheduleData, setScheduleData] = useState<ScheduleDay[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [lectures, setLectures] = useState<Lecture[]>([]);

  const subjects: Subject[] = [
    { name: 'Математический анализ', total: 24, attended: 22, color: 'bg-primary' },
    { name: 'Программирование', total: 20, attended: 19, color: 'bg-secondary' },
    { name: 'Физика', total: 22, attended: 18, color: 'bg-accent' },
    { name: 'Английский язык', total: 18, attended: 17, color: 'bg-[hsl(var(--success))]' }
  ];

  const weekSchedule = [
    {
      day: 'ПН',
      date: '11.11',
      lectures: [
        { name: 'Мат. анализ', time: '9:00', attended: true },
        { name: 'Физика', time: '10:45', attended: true },
        { name: 'Программ.', time: '13:00', attended: false }
      ]
    },
    {
      day: 'ВТ',
      date: '12.11',
      lectures: [
        { name: 'Англ. язык', time: '9:00', attended: true },
        { name: 'Мат. анализ', time: '10:45', attended: true }
      ]
    },
    {
      day: 'СР',
      date: '13.11',
      lectures: [
        { name: 'Программ.', time: '9:00', attended: true },
        { name: 'Физика', time: '13:00', attended: true }
      ]
    },
    {
      day: 'ЧТ',
      date: '14.11',
      lectures: [
        { name: 'Мат. анализ', time: '9:00', attended: true },
        { name: 'Англ. язык', time: '14:45', attended: false }
      ]
    },
    {
      day: 'ПТ',
      date: '15.11',
      lectures: [
        { name: 'Программ.', time: '9:00', attended: null },
        { name: 'Физика', time: '10:45', attended: null },
        { name: 'Англ. язык', time: '14:45', attended: null }
      ]
    }
  ];

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('https://functions.poehali.dev/ac1d7467-912b-476b-854b-2d20cbde054f');
        const data = await response.json();
        
        if (data.schedule && Array.isArray(data.schedule)) {
          setScheduleData(data.schedule);
          
          const todaySchedule = data.schedule.find((day: ScheduleDay) => 
            day.day === 'Понедельник'
          );
          
          if (todaySchedule) {
            const todayLectures = todaySchedule.lectures.map((lecture: ScheduleLecture, index: number) => ({
              id: index + 1,
              name: lecture.name,
              time: lecture.time,
              teacher: lecture.teacher,
              room: lecture.room,
              attended: index < 2 ? true : null,
              date: 'Сегодня'
            }));
            setLectures(todayLectures);
          }
        }
        
        if (data.groups && Array.isArray(data.groups)) {
          setAvailableGroups(data.groups);
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('Ошибка загрузки расписания:', error);
        setIsLoading(false);
      }
    };
    
    fetchSchedule();
  }, []);

  const toggleAttendance = (id: number) => {
    setLectures(
      lectures.map((lecture) =>
        lecture.id === id
          ? { ...lecture, attended: lecture.attended === null ? true : lecture.attended ? false : null }
          : lecture
      )
    );
  };

  const totalLectures = lectures.length || 4;
  const attendedLectures = lectures.filter((l) => l.attended === true).length;
  const attendanceRate = totalLectures > 0 ? Math.round((attendedLectures / totalLectures) * 100) : 50;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6 animate-fade-in">
        <header className="text-center space-y-4 mb-8">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            Посещаемость Пар
          </h1>
          <p className="text-muted-foreground text-lg">Отслеживай учёбу легко и стильно</p>
          
          <div className="flex items-center justify-center gap-3 mt-4">
            <Icon name="Users" size={20} className="text-primary" />
            <select
              value={selectedGroup}
              onChange={(e) => setSelectedGroup(e.target.value)}
              className="w-64 px-4 py-2 bg-white/80 backdrop-blur-sm border-2 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {availableGroups.map((group) => (
                <option key={group} value={group}>
                  {group}
                </option>
              ))}
            </select>
          </div>
        </header>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-lg text-muted-foreground">Загружаем расписание...</p>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card className="p-6 bg-white/80 backdrop-blur-sm border-2 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 animate-scale-in">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground font-medium">Общая посещаемость</p>
                    <p className="text-3xl font-bold mt-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                      {attendanceRate}%
                    </p>
                  </div>
                  <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center">
                    <Icon name="TrendingUp" className="text-white" size={32} />
                  </div>
                </div>
                <Progress value={attendanceRate} className="mt-4 h-2" />
              </Card>

              <Card className="p-6 bg-white/80 backdrop-blur-sm border-2 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 animate-scale-in" style={{ animationDelay: '0.1s' }}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground font-medium">Посещено пар</p>
                    <p className="text-3xl font-bold mt-2 text-[hsl(var(--success))]">
                      {attendedLectures}/{totalLectures}
                    </p>
                  </div>
                  <div className="w-16 h-16 bg-gradient-to-br from-[hsl(var(--success))] to-[hsl(var(--accent))] rounded-2xl flex items-center justify-center">
                    <Icon name="CheckCircle" className="text-white" size={32} />
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-white/80 backdrop-blur-sm border-2 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 animate-scale-in" style={{ animationDelay: '0.2s' }}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground font-medium">Предстоящие пары</p>
                    <p className="text-3xl font-bold mt-2 text-accent">
                      {lectures.filter((l) => l.attended === null).length}
                    </p>
                  </div>
                  <div className="w-16 h-16 bg-gradient-to-br from-accent to-secondary rounded-2xl flex items-center justify-center">
                    <Icon name="Clock" className="text-white" size={32} />
                  </div>
                </div>
              </Card>
            </div>

            <Tabs defaultValue="today" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-6 bg-white/60 backdrop-blur-sm p-1 h-auto">
                <TabsTrigger value="today" className="text-base py-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-secondary data-[state=active]:text-white">
                  <Icon name="Calendar" size={20} className="mr-2" />
                  Сегодня
                </TabsTrigger>
                <TabsTrigger value="schedule" className="text-base py-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-secondary data-[state=active]:text-white">
                  <Icon name="CalendarDays" size={20} className="mr-2" />
                  Расписание
                </TabsTrigger>
                <TabsTrigger value="stats" className="text-base py-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-secondary data-[state=active]:text-white">
                  <Icon name="BarChart3" size={20} className="mr-2" />
                  Статистика
                </TabsTrigger>
              </TabsList>

              <TabsContent value="today" className="space-y-4">
                {lectures.length > 0 ? lectures.map((lecture, index) => (
                  <Card
                    key={lecture.id}
                    className="p-6 bg-white/80 backdrop-blur-sm border-2 hover:shadow-lg transition-all duration-300 animate-slide-up"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-bold">{lecture.name}</h3>
                          {lecture.attended === true && (
                            <Badge className="bg-[hsl(var(--success))] hover:bg-[hsl(var(--success))]/90">
                              <Icon name="Check" size={14} className="mr-1" />
                              Посещено
                            </Badge>
                          )}
                          {lecture.attended === false && (
                            <Badge variant="destructive">
                              <Icon name="X" size={14} className="mr-1" />
                              Пропущено
                            </Badge>
                          )}
                          {lecture.attended === null && (
                            <Badge variant="secondary">
                              <Icon name="Clock" size={14} className="mr-1" />
                              Предстоит
                            </Badge>
                          )}
                        </div>
                        <div className="space-y-1 text-muted-foreground">
                          <p className="flex items-center gap-2">
                            <Icon name="Clock" size={16} />
                            {lecture.time}
                          </p>
                          <p className="flex items-center gap-2">
                            <Icon name="User" size={16} />
                            {lecture.teacher}
                          </p>
                          <p className="flex items-center gap-2">
                            <Icon name="MapPin" size={16} />
                            {lecture.room}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => toggleAttendance(lecture.id)}
                          variant={lecture.attended === true ? 'default' : 'outline'}
                          size="lg"
                          className={`${
                            lecture.attended === true
                              ? 'bg-gradient-to-r from-[hsl(var(--success))] to-[hsl(var(--accent))] hover:opacity-90'
                              : ''
                          } transition-all hover:scale-105`}
                        >
                          <Icon name={lecture.attended === true ? 'CheckCircle' : 'Circle'} size={20} className="mr-2" />
                          {lecture.attended === true ? 'Был' : 'Отметить'}
                        </Button>
                        {lecture.attended !== null && (
                          <Button
                            onClick={() => toggleAttendance(lecture.id)}
                            variant="outline"
                            size="lg"
                            className="transition-all hover:scale-105"
                          >
                            <Icon name="RotateCcw" size={20} />
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                )) : (
                  <Card className="p-8 bg-white/80 backdrop-blur-sm border-2 text-center">
                    <Icon name="Calendar" size={48} className="mx-auto mb-4 text-muted-foreground" />
                    <p className="text-lg text-muted-foreground">На сегодня пар нет</p>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="schedule" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  {scheduleData.length > 0 ? scheduleData.map((day, index) => (
                    <Card
                      key={day.day}
                      className="p-4 bg-white/80 backdrop-blur-sm border-2 hover:shadow-lg transition-all duration-300 animate-slide-up"
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      <div className="text-center mb-4">
                        <h3 className="text-xl font-bold">{day.day.slice(0, 2).toUpperCase()}</h3>
                        <p className="text-sm text-muted-foreground">{day.date}</p>
                      </div>
                      <div className="space-y-3">
                        {day.lectures.map((lecture, idx) => (
                          <div
                            key={idx}
                            className="p-3 rounded-lg border-2 bg-secondary/10 border-secondary"
                          >
                            <p className="font-semibold text-sm mb-1">{lecture.name}</p>
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                              <Icon name="Clock" size={12} />
                              {lecture.time}
                            </p>
                          </div>
                        ))}
                      </div>
                    </Card>
                  )) : weekSchedule.map((day, index) => (
                    <Card
                      key={day.day}
                      className="p-4 bg-white/80 backdrop-blur-sm border-2 hover:shadow-lg transition-all duration-300 animate-slide-up"
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      <div className="text-center mb-4">
                        <h3 className="text-xl font-bold">{day.day}</h3>
                        <p className="text-sm text-muted-foreground">{day.date}</p>
                      </div>
                      <div className="space-y-3">
                        {day.lectures.map((lecture, idx) => (
                          <div
                            key={idx}
                            className={`p-3 rounded-lg border-2 ${
                              lecture.attended === true
                                ? 'bg-[hsl(var(--success))]/10 border-[hsl(var(--success))]'
                                : lecture.attended === false
                                ? 'bg-destructive/10 border-destructive'
                                : 'bg-secondary/10 border-secondary'
                            }`}
                          >
                            <p className="font-semibold text-sm mb-1">{lecture.name}</p>
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                              <Icon name="Clock" size={12} />
                              {lecture.time}
                            </p>
                          </div>
                        ))}
                      </div>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="stats" className="space-y-6">
                <Card className="p-6 bg-white/80 backdrop-blur-sm border-2">
                  <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
                    <Icon name="TrendingUp" size={28} />
                    Посещаемость по предметам
                  </h3>
                  <div className="space-y-6">
                    {subjects.map((subject, index) => {
                      const percentage = Math.round((subject.attended / subject.total) * 100);
                      return (
                        <div key={index} className="space-y-2 animate-slide-up" style={{ animationDelay: `${index * 0.1}s` }}>
                          <div className="flex justify-between items-center">
                            <h4 className="font-semibold text-lg">{subject.name}</h4>
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-muted-foreground">
                                {subject.attended}/{subject.total}
                              </span>
                              <Badge className={`${subject.color} text-white`}>{percentage}%</Badge>
                            </div>
                          </div>
                          <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className={`h-full ${subject.color} rounded-full transition-all duration-1000 ease-out`}
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="p-6 bg-gradient-to-br from-primary to-secondary text-white">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold">Лучшая посещаемость</h3>
                      <Icon name="Award" size={32} />
                    </div>
                    <p className="text-3xl font-bold">{subjects[0].name}</p>
                    <p className="text-sm opacity-90 mt-2">
                      {Math.round((subjects[0].attended / subjects[0].total) * 100)}% посещений
                    </p>
                  </Card>

                  <Card className="p-6 bg-gradient-to-br from-accent to-secondary text-white">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold">Всего пар пройдено</h3>
                      <Icon name="BookOpen" size={32} />
                    </div>
                    <p className="text-3xl font-bold">{subjects.reduce((acc, s) => acc + s.attended, 0)}</p>
                    <p className="text-sm opacity-90 mt-2">из {subjects.reduce((acc, s) => acc + s.total, 0)} запланированных</p>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>

            <Card className="p-6 bg-gradient-to-r from-primary via-secondary to-accent text-white border-0 shadow-2xl">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                  <Icon name="Bell" size={28} />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-1">Push-уведомления активны</h3>
                  <p className="text-sm opacity-90">
                    Мы напомним о предстоящих парах за 15 минут и сообщим об изменениях в расписании
                  </p>
                </div>
                <Button variant="secondary" size="lg" className="bg-white text-primary hover:bg-white/90">
                  <Icon name="Settings" size={20} className="mr-2" />
                  Настроить
                </Button>
              </div>
            </Card>
          </>
        )}
      </div>
    </div>
  );
};

export default Index;
