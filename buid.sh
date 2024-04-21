docker build -t hubserver:draft hubserver
docker build -t gameserver:draft gameserver
kubectl delete -f ./k8s
kubectl apply -f ./k8s