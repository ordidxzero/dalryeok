# dalryeok

1. 각 Event는 atom으로 관리한다.
2. Tree를 구현하며 각 노드에는 atom이 위치한다.
3. Tree 구조는 기존에 없는 것으로 추정되는 방식을 사용한다.
   1. 기본 아이디어는 BST이다.
   2. Event의 start date를 기준으로 오름차순 정렬한 후 Tree로 만든다.
   3. 만약 start date가 겹치면 sibling끼리 연결하며, 마지막 sibling에 children이 연결된다.