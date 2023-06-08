
Генератор работает предназначен для небольшого количества рядов. Работает на основе пятеричной системы исчисления, так как самый удобный вид представления для абакуса. Алгоритм работы:

1. Преобразовает все переданные настройки из десятичной системы в пятеричную.
2. Генерирует количество цифр в каждом ряду.
3. На основе предыдущей генерации высчитывает, какой длины должны быть столбцы
4. Рекурсивно генерирует все возможные столбцы
5. Сортирует все эти столбцы на основе количества использованных уникальных комбинаций(комбинация - два числа, при сложении которых используется формула) и уникальных чисел в столбце)
6. Из всех столбцов, подходящих по длине для последнего ряда, отфильтровываются те, которые удовлетворяют следующим условиям(условия идут по приоритетам):
* Чтобы все использованные комбинации содеражали только те цифры, которые отмечены как приоритетные
* Если нет таких, что выше, то выбираются те, где хотя бы одна использованная комбинации содеражала только те цифры, которые отмечены как приоритетные
* Если нет таких, то просто берутся все столбцы.
7. Далее отфильтрованный список комбинаций перемешивается и  выбрается столбец для последнего столбца( потому что последний ряд всегда самый длинный).
8. Далее фильтруются такие столбцы, чтобы на каждом ряду все цифры имели один и тот же знак.
9. Если таких столбцов оказалось меньше, чем выбранное количество цифр, то 7-8 шаги повторяются, пока результат не будет удовлетворительным.
10. Если в итоге все равно не наберется достаточно столбцов, то все начинается заново с шага 2.
11. Далее отфильтрованные по знаку столбцы фильтруются по следующим параметрам( по приоритету ):
* Были ли использованы комбинации, в которых используются цифры, указанные как приоритетные
* Были ли использованы комбинации, которые использовались в других, ранее выбранных столбцах.
* Исползовался ли этот столбец в предыдущих примерах
12. После из отфильтрованного списка столбцов, рандомно выбираются столбцы.
13. Выбранные столбцы преобразуются в ряды
14. Все цифры преобразуются из пятеричной в десятичную и все оборачивается в пример и возвращается
