# cadius-action
A Github Action for installing Cadius and allowing you to manipulate ProDOS disk images with it.


# Example usage
```
workflow "All pushes" {
  on = "push"
  resolves = ["Make a Disk"]
}

action "Make a Disk" {
  uses = "digarok/cadius-action@master"
  run = "cadius createvolume exampledsk.po exampledsk 140KB"
}
```


