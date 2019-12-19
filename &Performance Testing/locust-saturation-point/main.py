from locust import HttpLocust, TaskSet, task, between


class UserBehavior(TaskSet):
   def on_start(self):
       self.client.get("/")

   # @task(1)
   # def rules(self):
   #     res = self.client.get("/index.php?topic=977.0")


class WebsiteUser(HttpLocust):
   task_set = UserBehavior
   wait_time = between(1000, 2000)
